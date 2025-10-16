require 'rails_helper'

RSpec.describe 'Api::EvaluatedPromises', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let!(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/evaluated-promises' do
    context '認証済みユーザーの場合' do
      let!(:evaluated_promise1) do
        promise = create(:promise, partnership: partnership, creator: user)
        create(:promise_evaluation, promise: promise, evaluator: partner, rating: 5)
        promise
      end

      let!(:evaluated_promise2) do
        promise = create(:promise, partnership: partnership, creator: user)
        create(:promise_evaluation, promise: promise, evaluator: partner, rating: 4)
        promise
      end

      let!(:unevaluated_promise) { create(:promise, partnership: partnership, creator: user) }

      it '200ステータスを返す' do
        get '/api/evaluated-promises', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '評価済みの約束のみを返す' do
        get '/api/evaluated-promises', headers: headers
        json = json_response
        expect(json.length).to eq(2)
        expect(json.map { |p| p['id'] }).to include(evaluated_promise1.id, evaluated_promise2.id)
        expect(json.map { |p| p['id'] }).not_to include(unevaluated_promise.id)
      end

      it '評価情報を含む' do
        get '/api/evaluated-promises', headers: headers
        json = json_response
        first_evaluation = json.first
        expect(first_evaluation).to have_key('rating')
        expect(first_evaluation).to have_key('evaluation_text')
        expect(first_evaluation).to have_key('evaluation_date')
      end

      context '年月パラメータがある場合' do
        before do
          evaluated_promise1.promise_evaluation.update(created_at: Date.new(2025, 1, 15))
          evaluated_promise2.promise_evaluation.update(created_at: Date.new(2025, 2, 10))
        end

        it '指定された年月の評価のみを返す' do
          get '/api/evaluated-promises', params: { year: 2025, month: 1 }, headers: headers
          json = json_response
          expect(json.length).to eq(1)
          expect(json.first['id']).to eq(evaluated_promise1.id)
        end
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '空配列を返す' do
        get '/api/evaluated-promises', headers: headers_without_partnership
        json = json_response
        expect(json).to eq([])
      end
    end
  end
end

