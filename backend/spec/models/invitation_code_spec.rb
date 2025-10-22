require 'rails_helper'

RSpec.describe InvitationCode, type: :model do
  describe 'validations' do
    it 'codeが存在すること' do
      invitation_code = create(:invitation_code)
      expect(invitation_code.code).to be_present
    end

    it 'codeがユニークであること' do
      code1 = create(:invitation_code)
      code2 = build(:invitation_code, code: code1.code)
      expect(code2).not_to be_valid
    end

    it 'codeが8文字であること' do
      invitation_code = create(:invitation_code)
      expect(invitation_code.code.length).to eq(8)
    end
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:active_code) { create(:invitation_code, inviter: user, used: false) }
    let!(:used_code) { create(:invitation_code, :used, inviter: user) }

    describe '.active' do
      it '未使用の招待コードのみを返す' do
        expect(InvitationCode.active).to include(active_code)
        expect(InvitationCode.active).not_to include(used_code)
      end
    end

    describe '.used' do
      it '使用済みの招待コードのみを返す' do
        expect(InvitationCode.used).to include(used_code)
        expect(InvitationCode.used).not_to include(active_code)
      end
    end
  end

  describe 'callbacks' do
    it '作成時に自動的にコードを生成する' do
      invitation_code = InvitationCode.new(inviter: create(:user))
      invitation_code.save
      expect(invitation_code.code).to be_present
      expect(invitation_code.code.length).to eq(8)
    end

    it '生成されたコードは英数字のみ' do
      invitation_code = create(:invitation_code)
      expect(invitation_code.code).to match(/\A[A-Z0-9]+\z/)
    end
  end

  describe '#join_partnership!' do
    let(:inviter) { create(:user) }
    let(:partner) { create(:user) }
    let(:invitation_code) { create(:invitation_code, inviter: inviter) }

    context '有効な招待コードの場合' do
      it 'Partnershipオブジェクトを返す' do
        result = invitation_code.join_partnership!(partner)
        expect(result).to be_a(Partnership)
        expect(result).to be_persisted
      end

      it '返されたpartnershipのuserとpartnerが正しい' do
        result = invitation_code.join_partnership!(partner)
        expect(result.user).to eq(inviter)
        expect(result.partner).to eq(partner)
      end

      it 'パートナーシップを作成する' do
        expect {
          invitation_code.join_partnership!(partner)
        }.to change(Partnership, :count).by(1)
      end

      it '招待コードを使用済みにする' do
        invitation_code.join_partnership!(partner)
        expect(invitation_code.reload.used).to be true
      end

      it 'デフォルトの約束を作成する' do
        partnership = invitation_code.join_partnership!(partner)
        expect(partnership.promises.count).to eq(3)
      end

      it 'デフォルトの約束は全てour_promise' do
        partnership = invitation_code.join_partnership!(partner)
        expect(partnership.promises.pluck(:type).uniq).to eq([ 'our_promise' ])
      end
    end

    context '自分の招待コードを使う場合' do
      it 'エラーを発生させる' do
        expect {
          invitation_code.join_partnership!(inviter)
        }.to raise_error(ArgumentError, "自分の招待コードは使用できません")
      end
    end

    context '既にパートナーシップがある場合' do
      before do
        create(:partnership, user: partner, partner: create(:user))
      end

      it 'エラーを発生させる' do
        expect {
          invitation_code.join_partnership!(partner)
        }.to raise_error(ArgumentError, "既にパートナーシップが存在します")
      end
    end

    context '既に使用済みの招待コードの場合' do
      before do
        invitation_code.update(used: true)
      end

      it 'エラーを発生させる' do
        expect {
          invitation_code.join_partnership!(partner)
        }.to raise_error(ArgumentError, "この招待コードは既に使用されています")
      end
    end
  end
end
