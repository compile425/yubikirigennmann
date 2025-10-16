require 'rails_helper'

RSpec.describe PromiseRatingScore, type: :model do
  describe 'associations' do
    it { should belong_to(:partnership) }
  end

  describe 'validations' do
    it '有効なレコードを作成できる' do
      score = build(:promise_rating_score)
      expect(score).to be_valid
    end

    it 'harvested_applesはデフォルトで0' do
      score = create(:promise_rating_score)
      expect(score.harvested_apples).to eq(0)
    end
  end

  describe '月別のりんご数管理' do
    let(:partnership) { create(:partnership) }

    it '同じ月のレコードは1つだけ作成される' do
      current_month = Date.current.beginning_of_month
      score1 = create(:promise_rating_score, partnership: partnership, year_month: current_month, harvested_apples: 3)
      
      score2 = partnership.promise_rating_scores.find_or_initialize_by(year_month: current_month)
      expect(score2.id).to eq(score1.id)
      expect(score2.harvested_apples).to eq(3)
    end

    it '異なる月のレコードは別々に作成される' do
      current_month = Date.current.beginning_of_month
      last_month = current_month - 1.month

      score1 = create(:promise_rating_score, partnership: partnership, year_month: current_month, harvested_apples: 5)
      score2 = create(:promise_rating_score, partnership: partnership, year_month: last_month, harvested_apples: 3)

      expect(partnership.promise_rating_scores.count).to eq(2)
    end
  end
end

