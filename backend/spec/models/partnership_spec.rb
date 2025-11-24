require 'rails_helper'

RSpec.describe Partnership, type: :model do
  describe '#partner_of' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let(:partnership) { create(:partnership, user: user, partner: partner) }

    it 'userを渡すとpartnerを返す' do
      expect(partnership.partner_of(user)).to eq(partner)
    end

    it 'partnerを渡すとuserを返す' do
      expect(partnership.partner_of(partner)).to eq(user)
    end
  end

  describe '#create_default_promises' do
    let(:partnership) { create(:partnership) }

    it 'デフォルトの約束を3つ作成する' do
      expect {
        partnership.create_default_promises
      }.to change { partnership.promises.count }.by(3)
    end

    it '全てour_promiseタイプで作成される' do
      partnership.create_default_promises
      expect(partnership.promises.pluck(:type).uniq).to eq(['our_promise'])
    end

    it '期日がnilで作成される' do
      partnership.create_default_promises
      expect(partnership.promises.pluck(:due_date).uniq).to eq([nil])
    end
  end

  describe '#dissolve!' do
    let!(:partnership) { create(:partnership, :with_promises) }

    it '削除処理が完了する' do
      expect { partnership.dissolve! }.not_to raise_error
    end

    it 'パートナーシップを削除する' do
      partnership_id = partnership.id
      partnership.dissolve!
      expect(Partnership.find_by(id: partnership_id)).to be_nil
    end

    it '関連する約束も削除する' do
      promise_ids = partnership.promises.pluck(:id)
      partnership.dissolve!
      expect(Promise.where(id: promise_ids).count).to eq(0)
    end

    it 'Promiseのカウントが減る' do
      promise_count = partnership.promises.count
      expect {
        partnership.dissolve!
      }.to change(Promise, :count).by(-promise_count)
    end

    it 'Partnershipのカウントが減る' do
      expect {
        partnership.dissolve!
      }.to change(Partnership, :count).by(-1)
    end

    it 'トランザクション内で実行される' do
      allow(partnership.promises).to receive(:destroy_all).and_raise(StandardError, 'Test error')
      
      expect {
        partnership.dissolve! rescue nil
      }.not_to change(Partnership, :count)
    end
  end

  describe '#pending_evaluations_for' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let(:partnership) { create(:partnership, user: user, partner: partner) }

    it 'ActiveRecord::Relationを返す' do
      result = partnership.pending_evaluations_for(user)
      expect(result).to be_a(ActiveRecord::Relation)
    end

    it '空の場合は空の配列のようなオブジェクトを返す' do
      result = partnership.pending_evaluations_for(user)
      expect(result.to_a).to eq([])
    end

    context '相手が作成した期日が来た約束がある場合' do
      let!(:overdue_promise) do
        promise = create(:promise, partnership: partnership, creator: partner, due_date: 1.day.from_now.to_date)
        promise.update_column(:due_date, 1.day.ago.to_date)
        promise
      end
      let!(:future_promise) { create(:promise, partnership: partnership, creator: partner, due_date: 7.days.from_now.to_date) }

      it '期日が来た約束のみを返す' do
        result = partnership.pending_evaluations_for(user)
        expect(result.map(&:id)).to include(overdue_promise.id)
        expect(result.map(&:id)).not_to include(future_promise.id)
      end

      it '返される約束にcreatorがeager loadされている' do
        result = partnership.pending_evaluations_for(user)
        expect(result.first.association(:creator).loaded?).to be true
      end
    end

    context '今週評価すべきふたりの約束がある場合' do
      let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

      it '自分が今週の評価者なら、ふたりの約束を含む' do
        allow(Promise).to receive(:weekly_evaluator).with(partnership).and_return(user)
        result = partnership.pending_evaluations_for(user)
        expect(result).to include(our_promise)
      end

      it '相手が今週の評価者なら、ふたりの約束を含まない' do
        allow(Promise).to receive(:weekly_evaluator).with(partnership).and_return(partner)
        result = partnership.pending_evaluations_for(user)
        expect(result).not_to include(our_promise)
      end
    end
  end

  describe '#monthly_apple_count' do
    let(:partnership) { create(:partnership) }

    it '当月のりんご数を返す' do
      current_month = Date.current.beginning_of_month
      partnership.promise_rating_scores.create!(
        year_month: current_month,
        harvested_apples: 5
      )

      expect(partnership.monthly_apple_count).to eq(5)
    end

    it '先月のりんご数は含まない' do
      last_month = Date.current.beginning_of_month - 1.month
      partnership.promise_rating_scores.create!(
        year_month: last_month,
        harvested_apples: 3
      )

      expect(partnership.monthly_apple_count).to eq(0)
    end
  end

  describe '#send_weekly_evaluation_email!' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let(:partnership) { create(:partnership, user: user, partner: partner) }
    let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

    it '結果ハッシュを返す' do
      result = partnership.send_weekly_evaluation_email!(user)
      expect(result).to be_a(Hash)
      expect(result).to have_key(:promise)
      expect(result).to have_key(:partner)
      expect(result).to have_key(:sender)
    end

    it '正しい約束とパートナー情報を返す' do
      result = partnership.send_weekly_evaluation_email!(user)
      expect(result[:promise]).to eq(our_promise)
      expect(result[:partner]).to eq(partner)
      expect(result[:sender]).to eq(user)
    end

    it 'メールが送信される' do
      expect {
        partnership.send_weekly_evaluation_email!(user)
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'パートナーにメールが送信される' do
      partnership.send_weekly_evaluation_email!(user)
      mail = ActionMailer::Base.deliveries.last
      expect(mail.to).to include(partner.email)
    end

    context 'ふたりの約束がない場合' do
      before do
        our_promise.destroy
      end

      it 'エラーを発生させる' do
        expect {
          partnership.send_weekly_evaluation_email!(user)
        }.to raise_error(ArgumentError, "評価対象の約束が見つかりません")
      end

      it 'メールが送信されない' do
        expect {
          begin
            partnership.send_weekly_evaluation_email!(user)
          rescue ArgumentError
          end
        }.not_to change { ActionMailer::Base.deliveries.count }
      end
    end
  end

  describe '#monthly_stats' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let(:partnership) { create(:partnership, user: user, partner: partner) }
    let(:target_month) { Date.new(2025, 1, 1) }

    before do
      promise1 = create(:promise, partnership: partnership, creator: partner)
      eval1 = create(:promise_evaluation, promise: promise1, evaluator: user, rating: 5)
      eval1.update(created_at: Date.new(2025, 1, 15))

      promise2 = create(:promise, partnership: partnership, creator: partner)
      eval2 = create(:promise_evaluation, promise: promise2, evaluator: user, rating: 3)
      eval2.update(created_at: Date.new(2025, 1, 20))

      partnership.promise_rating_scores.create!(
        year_month: target_month,
        harvested_apples: 8
      )
    end

    it 'ハッシュを返す' do
      result = partnership.monthly_stats(user, target_month)
      expect(result).to be_a(Hash)
      expect(result).to have_key(:user)
      expect(result).to have_key(:partner)
      expect(result).to have_key(:apple_count)
      expect(result).to have_key(:year_month)
    end

    it 'ユーザーの統計情報が正しい' do
      result = partnership.monthly_stats(user, target_month)
      expect(result[:user][:name]).to eq(user.name)
      # userが作成した約束に対する評価がないため、スコアは0.0
      expect(result[:user][:average_score]).to eq(0.0)
      expect(result[:user][:evaluation_count]).to eq(0)
      # partnerが作成した約束をuserが評価しているため、partnerのスコアが4.0
      expect(result[:partner][:average_score]).to eq(4.0)
      expect(result[:partner][:evaluation_count]).to eq(2)
    end

    it 'パートナーの統計情報が正しい' do
      result = partnership.monthly_stats(user, target_month)
      expect(result[:partner][:name]).to eq(partner.name)
      # partnerが作成した約束をuserが評価しているため、partnerのスコアが4.0
      expect(result[:partner][:average_score]).to eq(4.0)
      expect(result[:partner][:evaluation_count]).to eq(2)
    end

    it 'りんご数が正しい' do
      result = partnership.monthly_stats(user, target_month)
      expect(result[:apple_count]).to eq(8)
    end

    it '対象月が正しい' do
      result = partnership.monthly_stats(user, target_month)
      expect(result[:year_month]).to eq(target_month)
    end

    it 'userとpartnerを入れ替えても正しく動作する' do
      result1 = partnership.monthly_stats(user, target_month)
      result2 = partnership.monthly_stats(partner, target_month)

      expect(result1[:user][:name]).to eq(user.name)
      expect(result1[:partner][:name]).to eq(partner.name)

      expect(result2[:user][:name]).to eq(partner.name)
      expect(result2[:partner][:name]).to eq(user.name)
    end

    context 'our_promiseの評価がある場合' do
      let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

      context '週番号が偶数の場合（userがweekly_evaluatee）' do
        before do
          evaluation = create(:promise_evaluation, promise: our_promise, evaluator: partner, rating: 5)
          # 偶数週の日付に設定（2025年1月6日は週番号2）
          evaluation.update(created_at: Time.zone.local(2025, 1, 6, 12, 0, 0))
        end

        it 'weekly_evaluatee（user）のスコアに反映される' do
          result = partnership.monthly_stats(user, target_month)
          # 週番号が偶数の場合、userがweekly_evaluateeなので、userのスコアに反映
          expect(result[:user][:average_score]).to eq(5.0)
          expect(result[:user][:evaluation_count]).to eq(1)
          # partnerは評価者なので、partnerのスコアには反映されない
          expect(result[:partner][:average_score]).to eq(4.0) # 既存の評価
          expect(result[:partner][:evaluation_count]).to eq(2) # 既存の評価
        end
      end

      context '週番号が奇数の場合（partnerがweekly_evaluatee）' do
        before do
          evaluation = create(:promise_evaluation, promise: our_promise, evaluator: user, rating: 4)
          # 奇数週の日付に設定（2025年1月13日は週番号3）
          evaluation.update(created_at: Time.zone.local(2025, 1, 13, 12, 0, 0))
        end

        it 'weekly_evaluatee（partner）のスコアに反映される' do
          result = partnership.monthly_stats(user, target_month)
          # 週番号が奇数の場合、partnerがweekly_evaluateeなので、partnerのスコアに反映
          # partnerの既存の評価（5, 3）と新しい評価（4）の平均 = (5 + 3 + 4) / 3 = 4.0
          expect(result[:partner][:average_score]).to eq(4.0)
          expect(result[:partner][:evaluation_count]).to eq(3)
          # userは評価者なので、userのスコアには反映されない
          expect(result[:user][:average_score]).to eq(0.0)
          expect(result[:user][:evaluation_count]).to eq(0)
        end
      end
    end
  end
end

