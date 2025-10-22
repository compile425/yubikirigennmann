require 'rails_helper'

RSpec.describe PromiseEvaluation, type: :model do
  describe 'validations' do
    it '有効な評価を作成できる' do
      partnership = create(:partnership)
      promise = create(:promise, partnership: partnership, creator: partnership.user)
      evaluation = build(:promise_evaluation, promise: promise, evaluator: partnership.partner)
      expect(evaluation).to be_valid
    end

    it 'ratingは1-5の範囲内である必要がある' do
      evaluation = build(:promise_evaluation, rating: 5)
      expect(evaluation).to be_valid

      evaluation.rating = 1
      expect(evaluation).to be_valid
    end
  end
end
