require 'rails_helper'

RSpec.describe 'Api::PendingEvaluations', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let!(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/pending-evaluations' do
    context '認証済みユーザーの場合' do
      context '相手が作成した期日が来た約束がある場合' do
        let!(:overdue_promise) do
          promise = create(:promise, partnership: partnership, creator: partner, due_date: 1.day.from_now.to_date)
          promise.update_column(:due_date, 1.day.ago.to_date)
          promise
        end
        let!(:future_promise) { create(:promise, partnership: partnership, creator: partner, due_date: 7.days.from_now.to_date) }

        it '200ステータスを返す' do
          get '/api/pending-evaluations', headers: headers
          expect(response).to have_http_status(:ok)
        end

        it '期日が来た約束のみを返す' do
          get '/api/pending-evaluations', headers: headers
          json = json_response
          expect(json.length).to eq(1)
          expect(json.first['id']).to eq(overdue_promise.id)
        end
      end

      context '今週評価すべきふたりの約束がある場合' do
        let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

        it '自分が今週の評価者なら、ふたりの約束を含む' do
          allow(Promise).to receive(:weekly_evaluator).with(partnership).and_return(user)
          get '/api/pending-evaluations', headers: headers
          json = json_response
          expect(json.map { |p| p['id'] }).to include(our_promise.id)
        end

        it '相手が今週の評価者なら、ふたりの約束を含まない' do
          allow(Promise).to receive(:weekly_evaluator).with(partnership).and_return(partner)
          get '/api/pending-evaluations', headers: headers
          json = json_response
          expect(json.map { |p| p['id'] }).not_to include(our_promise.id)
        end
      end

      context '評価済みの約束は含まれない' do
        let!(:evaluated_promise) do
          promise = create(:promise, partnership: partnership, creator: partner, due_date: 1.day.from_now.to_date)
          promise.update_column(:due_date, 1.day.ago.to_date)
          create(:promise_evaluation, promise: promise, evaluator: user, rating: 5)
          promise
        end

        it '評価済みの約束を返さない' do
          get '/api/pending-evaluations', headers: headers
          json = json_response
          expect(json.map { |p| p['id'] }).not_to include(evaluated_promise.id)
        end
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '空配列を返す' do
        get '/api/pending-evaluations', headers: headers_without_partnership
        json = json_response
        expect(json).to eq([])
      end
    end
  end
end
