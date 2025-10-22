require 'rails_helper'

RSpec.describe Promise, type: :model do
  describe 'validations' do
    context '期日のバリデーション' do
      let(:partnership) { create(:partnership) }

      it '未来の日付であれば有効' do
        promise = build(:promise, partnership: partnership, creator: partnership.user, due_date: 1.day.from_now.to_date)
        expect(promise).to be_valid
      end

      it '過去の日付であれば無効' do
        promise = build(:promise, partnership: partnership, creator: partnership.user, due_date: 1.day.ago.to_date)
        expect(promise).to be_invalid
        expect(promise.errors[:due_date]).to include('は過去の日付を設定できません')
      end

      it 'ふたりの約束の場合、期日がnilでも有効' do
        promise = build(:promise, :our_promise, partnership: partnership, creator: partnership.user, due_date: nil)
        expect(promise).to be_valid
      end
    end
  end

  describe 'scopes' do
    let(:partnership) { create(:partnership) }
    let!(:our_promise1) { create(:promise, :our_promise, partnership: partnership, creator: partnership.user) }
    let!(:our_promise2) { create(:promise, :our_promise, partnership: partnership, creator: partnership.user) }
    let!(:my_promise) { create(:promise, partnership: partnership, creator: partnership.user) }

    describe '.our_promises' do
      it 'ふたりの約束のみを返す' do
        expect(Promise.our_promises).to include(our_promise1, our_promise2)
        expect(Promise.our_promises).not_to include(my_promise)
      end
    end

    describe '.pending_our_promises' do
      before do
        create(:promise_evaluation, promise: our_promise2, evaluator: partnership.partner)
      end

      it '評価待ちのふたりの約束のみを返す' do
        expect(Promise.pending_our_promises).to include(our_promise1)
        expect(Promise.pending_our_promises).not_to include(our_promise2)
      end

      it '更新日順でソートされている' do
        our_promise1.touch
        expect(Promise.pending_our_promises.first).to eq(our_promise1)
      end
    end

    describe '.evaluated' do
      let!(:evaluated_promise) { create(:promise, :with_evaluation, partnership: partnership, creator: partnership.user) }

      it '評価済みの約束のみを返す' do
        expect(Promise.evaluated).to include(evaluated_promise)
        expect(Promise.evaluated).not_to include(my_promise)
      end
    end

    describe '.by_evaluation_month' do
      let!(:jan_promise) do
        promise = create(:promise, partnership: partnership, creator: partnership.user)
        evaluation = create(:promise_evaluation, promise: promise, evaluator: partnership.partner)
        evaluation.update(created_at: Date.new(2025, 1, 15))
        promise
      end

      let!(:feb_promise) do
        promise = create(:promise, partnership: partnership, creator: partnership.user)
        evaluation = create(:promise_evaluation, promise: promise, evaluator: partnership.partner)
        evaluation.update(created_at: Date.new(2025, 2, 10))
        promise
      end

      it '指定された年月で評価された約束を返す' do
        result = Promise.evaluated.by_evaluation_month(2025, 1)
        expect(result).to include(jan_promise)
        expect(result).not_to include(feb_promise)
      end
    end
  end

  describe '.weekly_evaluator' do
    let(:partnership) { create(:partnership) }

    it '偶数週にはpartnerを返す' do
      allow(Date).to receive(:current).and_return(Date.new(2025, 1, 6)) # 2025年第2週（偶数）
      expect(Promise.weekly_evaluator(partnership)).to eq(partnership.partner)
    end

    it '奇数週にはuserを返す' do
      allow(Date).to receive(:current).and_return(Date.new(2025, 1, 13)) # 2025年第3週（奇数）
      expect(Promise.weekly_evaluator(partnership)).to eq(partnership.user)
    end
  end

  describe '#evaluate!' do
    let(:partnership) { create(:partnership) }
    let(:promise) { create(:promise, partnership: partnership, creator: partnership.user) }
    let(:evaluator) { partnership.partner }

    context '有効な評価の場合' do
      it '評価オブジェクトを返す' do
        rating = 5
        evaluation_text = 'Great!'

        result = promise.evaluate!(
          evaluator: evaluator,
          rating: rating,
          evaluation_text: evaluation_text
        )

        expect(result).to be_a(PromiseEvaluation)
        expect(result.rating).to eq(5)
        expect(result.evaluation_text).to eq('Great!')
        expect(result.evaluator).to eq(evaluator)
      end

      it '評価が永続化されている' do
        rating = 5
        evaluation_text = 'Great!'

        result = promise.evaluate!(
          evaluator: evaluator,
          rating: rating,
          evaluation_text: evaluation_text
        )

        expect(result).to be_persisted
        expect(result.id).to be_present
      end

      it '評価を作成できる' do
        rating = 5
        evaluation_text = 'Great!'

        expect {
          promise.evaluate!(
            evaluator: evaluator,
            rating: rating,
            evaluation_text: evaluation_text
          )
        }.to change(PromiseEvaluation, :count).by(1)
      end

      it 'updated_atが更新される' do
        old_updated_at = promise.updated_at
        rating = 5
        evaluation_text = 'Great!'

        promise.evaluate!(
          evaluator: evaluator,
          rating: rating,
          evaluation_text: evaluation_text
        )

        expect(promise.reload.updated_at).to be > old_updated_at
      end

      it 'promiseにevaluationが関連付けられる' do
        rating = 5
        evaluation_text = 'Great!'

        promise.evaluate!(
          evaluator: evaluator,
          rating: rating,
          evaluation_text: evaluation_text
        )

        expect(promise.reload.promise_evaluation).to be_present
        expect(promise.promise_evaluation.rating).to eq(5)
      end

      context '評価が4以上の場合' do
        it 'アップルカウントが増える' do
          expect {
            promise.evaluate!(
              evaluator: evaluator,
              rating: 4,
              evaluation_text: 'Good!'
            )
          }.to change { partnership.promise_rating_scores.sum(:harvested_apples) }.by(1)
        end

        it 'PromiseRatingScoreレコードが作成される' do
          expect {
            promise.evaluate!(
              evaluator: evaluator,
              rating: 4,
              evaluation_text: 'Good!'
            )
          }.to change { partnership.promise_rating_scores.count }.by(1)
        end

        it '当月のスコアレコードに追加される' do
          promise.evaluate!(
            evaluator: evaluator,
            rating: 4,
            evaluation_text: 'Good!'
          )
          current_month = Date.current.beginning_of_month
          score = partnership.promise_rating_scores.find_by(year_month: current_month)
          expect(score).to be_present
          expect(score.harvested_apples).to eq(1)
        end
      end

      context '評価が3以下の場合' do
        it 'アップルカウントが増えない' do
          expect {
            promise.evaluate!(
              evaluator: evaluator,
              rating: 3,
              evaluation_text: 'OK'
            )
          }.not_to change { partnership.promise_rating_scores.sum(:harvested_apples) }
        end

        it 'PromiseRatingScoreレコードが作成されない' do
          expect {
            promise.evaluate!(
              evaluator: evaluator,
              rating: 3,
              evaluation_text: 'OK'
            )
          }.not_to change { partnership.promise_rating_scores.count }
        end
      end
    end

    context '無効な評価の場合' do
      it 'エラーを発生させる' do
        expect {
          promise.evaluate!(
            evaluator: evaluator,
            rating: nil,
            evaluation_text: ''
          )
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end

  describe '#reset_for_next_evaluation' do
    let(:partnership) { create(:partnership) }
    let!(:promise) { create(:promise, :with_evaluation, :our_promise, partnership: partnership, creator: partnership.user) }

    it '成功時にtrueを返す' do
      result = promise.reset_for_next_evaluation
      expect(result).to be true
    end

    it '評価がない場合はfalseを返す' do
      promise_without_evaluation = create(:promise, :our_promise, partnership: partnership, creator: partnership.user)
      expect(promise_without_evaluation.reset_for_next_evaluation).to be false
    end

    it '評価を削除する' do
      expect {
        promise.reset_for_next_evaluation
      }.to change(PromiseEvaluation, :count).by(-1)
    end

    it 'promiseからevaluationが削除される' do
      promise.reset_for_next_evaluation
      expect(promise.reload.promise_evaluation).to be_nil
    end

    it 'updated_atが更新される' do
      old_updated_at = promise.updated_at
      sleep(0.1)
      promise.reset_for_next_evaluation
      expect(promise.reload.updated_at).to be > old_updated_at
    end
  end

  describe '.reset_evaluated_our_promises' do
    let(:partnership1) { create(:partnership) }
    let(:partnership2) { create(:partnership) }
    let!(:our_promise1) { create(:promise, :with_evaluation, :our_promise, partnership: partnership1, creator: partnership1.user) }
    let!(:our_promise2) { create(:promise, :with_evaluation, :our_promise, partnership: partnership2, creator: partnership2.user) }
    let!(:our_promise_no_eval) { create(:promise, :our_promise, partnership: partnership1, creator: partnership1.user) }

    it 'リセットした件数を返す' do
      result = Promise.reset_evaluated_our_promises
      expect(result).to be_a(Integer)
      expect(result).to eq(2) # 評価済みの2件
    end

    it '評価済みのふたりの約束をリセットする' do
      expect {
        Promise.reset_evaluated_our_promises
      }.to change(PromiseEvaluation, :count).by(-2)
    end

    it '評価がない約束には影響しない' do
      Promise.reset_evaluated_our_promises
      expect(our_promise_no_eval.reload.promise_evaluation).to be_nil
    end

    it 'ふたりの約束のみが対象' do
      regular_promise = create(:promise, :with_evaluation, partnership: partnership1, creator: partnership1.user)

      expect {
        Promise.reset_evaluated_our_promises
      }.not_to change { regular_promise.reload.promise_evaluation }
    end
  end
end
