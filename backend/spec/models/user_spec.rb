require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_one(:user_credential).dependent(:destroy) }
    it { should have_many(:partnerships_as_user).dependent(:destroy) }
    it { should have_many(:partnerships_as_partner).dependent(:destroy) }
    it { should have_many(:created_promises).dependent(:destroy) }
    it { should have_many(:evaluated_promises).dependent(:destroy) }
  end

  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:name) }

    it 'emailがユニークであること' do
      user1 = create(:user)
      user2 = build(:user, email: user1.email)
      expect(user2).not_to be_valid
    end
  end

  describe '#partnership' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }

    context 'userとしてのパートナーシップがある場合' do
      let!(:partnership) { create(:partnership, user: user, partner: partner) }

      it 'パートナーシップを返す' do
        expect(user.partnership).to eq(partnership)
      end
    end

    context 'partnerとしてのパートナーシップがある場合' do
      let!(:partnership) { create(:partnership, user: partner, partner: user) }

      it 'パートナーシップを返す' do
        expect(user.partnership).to eq(partnership)
      end
    end

    context 'パートナーシップがない場合' do
      it 'nilを返す' do
        expect(user.partnership).to be_nil
      end
    end
  end

  describe '#average_score' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let(:partnership) { create(:partnership, user: user, partner: partner) }

    context '評価がない場合' do
      it '0.0を返す' do
        expect(user.average_score).to eq(0.0)
      end
    end

    context '評価がある場合' do
      let!(:promise1) { create(:promise, partnership: partnership, creator: partner) }
      let!(:promise2) { create(:promise, partnership: partnership, creator: partner) }

      before do
        create(:promise_evaluation, promise: promise1, evaluator: user, rating: 5)
        create(:promise_evaluation, promise: promise2, evaluator: user, rating: 3)
      end

      it '平均スコアを返す' do
        expect(user.average_score).to eq(4.0)
      end
    end
  end

  describe '#score_trend' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let(:partnership) { create(:partnership, user: user, partner: partner) }

    it 'スコアのトレンドを計算する' do
      current_month = Date.current.beginning_of_month
      last_month = current_month - 1.month

      # 先月の評価
      last_promise = create(:promise, partnership: partnership, creator: partner)
      last_eval = create(:promise_evaluation, promise: last_promise, evaluator: user, rating: 3)
      last_eval.update(created_at: last_month + 10.days)

      # 今月の評価
      current_promise = create(:promise, partnership: partnership, creator: partner)
      current_eval = create(:promise_evaluation, promise: current_promise, evaluator: user, rating: 5)
      current_eval.update(created_at: current_month + 10.days)

      expect(user.score_trend).to eq(2.0)
    end
  end

  describe '.create_with_credential!' do
    let(:user_params) { { name: 'Test User', email: 'test@example.com' } }
    let(:credential_params) { { password: 'password123', password_confirmation: 'password123' } }

    it '作成したユーザーを返す' do
      user = User.create_with_credential!(user_params, credential_params)
      expect(user).to be_a(User)
      expect(user).to be_persisted
      expect(user.name).to eq('Test User')
      expect(user.email).to eq('test@example.com')
    end

    it '返されたユーザーに認証情報が関連付けられている' do
      user = User.create_with_credential!(user_params, credential_params)
      expect(user.user_credential).to be_present
      expect(user.user_credential.authenticate('password123')).to be_truthy
    end

    it 'ユーザーと認証情報を作成する' do
      expect {
        User.create_with_credential!(user_params, credential_params)
      }.to change(User, :count).by(1)
        .and change(UserCredential, :count).by(1)
    end

    it 'データベースにユーザーが保存される' do
      user = User.create_with_credential!(user_params, credential_params)
      saved_user = User.find(user.id)
      expect(saved_user.email).to eq('test@example.com')
    end

    it 'トランザクション内で実行される' do
      # UserCredentialの作成が失敗した場合、Userも作成されない
      allow_any_instance_of(User).to receive(:create_user_credential!).and_raise(ActiveRecord::RecordInvalid.new(UserCredential.new))
      
      expect {
        begin
          User.create_with_credential!(user_params, credential_params)
        rescue ActiveRecord::RecordInvalid
        end
      }.not_to change(User, :count)
    end

    context '無効なパラメータの場合' do
      let(:invalid_params) { { name: '', email: '' } }

      it 'エラーを発生させる' do
        expect {
          User.create_with_credential!(invalid_params, credential_params)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it 'ユーザーもCredentialも作成されない' do
        expect {
          begin
            User.create_with_credential!(invalid_params, credential_params)
          rescue ActiveRecord::RecordInvalid
          end
        }.not_to change(User, :count)

        expect {
          begin
            User.create_with_credential!(invalid_params, credential_params)
          rescue ActiveRecord::RecordInvalid
          end
        }.not_to change(UserCredential, :count)
      end
    end
  end

  describe '#reset_password!' do
    let(:user) { create(:user) }

    before do
      user.generate_password_reset_token
    end

    context '有効なトークンの場合' do
      it '処理が完了する' do
        expect {
          user.reset_password!('newpassword123')
        }.not_to raise_error
      end

      it 'パスワードが更新される' do
        user.reset_password!('newpassword123')
        user.reload
        expect(user.user_credential.authenticate('newpassword123')).to be_truthy
        expect(user.user_credential.authenticate('password123')).to be_falsey
      end

      it 'リセットトークンがクリアされる' do
        user.reset_password!('newpassword123')
        user.reload
        expect(user.reset_password_token).to be_nil
        expect(user.reset_password_sent_at).to be_nil
      end

      it 'トランザクション内で実行される' do
        original_token = user.reset_password_token
        allow(user.user_credential).to receive(:update!).and_raise(ActiveRecord::RecordInvalid.new(user.user_credential))

        begin
          user.reset_password!('newpassword123')
        rescue ActiveRecord::RecordInvalid
        end

        user.reload
        # トランザクションが失敗した場合、トークンはクリアされない
        expect(user.reset_password_token).to eq(original_token)
        # パスワードも更新されない
        expect(user.user_credential.authenticate('password123')).to be_truthy
      end
    end

    context 'トークンがない場合' do
      before do
        user.clear_password_reset_token
      end

      it 'エラーを発生させる' do
        expect {
          user.reset_password!('newpassword123')
        }.to raise_error(ArgumentError, "無効なトークンです")
      end

      it 'パスワードが更新されない' do
        old_password_digest = user.user_credential.password_digest
        begin
          user.reset_password!('newpassword123')
        rescue ArgumentError
        end
        expect(user.reload.user_credential.password_digest).to eq(old_password_digest)
      end
    end

    context 'トークンの有効期限が切れている場合' do
      before do
        user.update(reset_password_sent_at: 3.hours.ago)
      end

      it 'エラーを発生させる' do
        expect {
          user.reset_password!('newpassword123')
        }.to raise_error(ArgumentError, "トークンの有効期限が切れています")
      end
    end
  end

  describe '#send_password_reset_email!' do
    let(:user) { create(:user) }

    it 'メールオブジェクトを返す' do
      result = user.send_password_reset_email!
      expect(result).to be_a(Mail::Message)
    end

    it 'リセットトークンが生成される' do
      user.send_password_reset_email!
      user.reload
      expect(user.reset_password_token).to be_present
      expect(user.reset_password_sent_at).to be_present
    end

    it 'メールが送信される' do
      expect {
        user.send_password_reset_email!
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it '送信されるメールの宛先が正しい' do
      user.send_password_reset_email!
      mail = ActionMailer::Base.deliveries.last
      expect(mail.to).to include(user.email)
    end
  end
end

