require 'rails_helper'

RSpec.describe 'Api::PromiseEvaluations', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:promise) { create(:promise, partnership: partnership, creator: partner) }

  describe 'POST /api/promises/:promise_id/promise_evaluations' do
    context '認証済みユーザーの場合' do
      let(:headers) { auth_headers(user) }

      context '有効なパラメータの場合' do
        let(:valid_params) do
          {
            evaluation: {
              rating: 5,
              evaluation_text: 'とても良かったです！'
            }
          }
        end

        it '201ステータスを返す' do
          post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers

          expect(response).to have_http_status(:created)
        end

        it '評価データをJSON形式で返す' do
          post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers

          json = json_response
          expect(json['rating']).to eq(5)
          expect(json['evaluation_text']).to eq('とても良かったです！')
          expect(json['evaluator_id']).to eq(user.id)
        end

        it 'レスポンスにidが含まれる' do
          post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers

          json = json_response
          expect(json['id']).to be_present
        end

        it '評価を作成できる' do
          expect {
            post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers
          }.to change(PromiseEvaluation, :count).by(1)
        end

        it 'データベースに評価が保存される' do
          post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers

          evaluation = PromiseEvaluation.last
          expect(evaluation.rating).to eq(5)
          expect(evaluation.evaluation_text).to eq('とても良かったです！')
          expect(evaluation.promise_id).to eq(promise.id)
        end

        it 'promiseのupdated_atが更新される' do
          old_updated_at = promise.updated_at
          sleep(0.1)

          post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers

          expect(promise.reload.updated_at).to be > old_updated_at
        end

        context '評価が4以上の場合' do
          it 'アップルカウントが増える' do
            expect {
              post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers
            }.to change { partnership.promise_rating_scores.sum(:harvested_apples) }.by(1)
          end

          it 'PromiseRatingScoreレコードが作成される' do
            expect {
              post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers
            }.to change(PromiseRatingScore, :count).by(1)
          end

          it '当月のスコアに記録される' do
            post "/api/promises/#{promise.id}/promise_evaluations", params: valid_params, headers: headers
            current_month = Date.current.beginning_of_month
            score = partnership.promise_rating_scores.find_by(year_month: current_month)
            expect(score.harvested_apples).to eq(1)
          end
        end

        context '評価が3以下の場合' do
          let(:low_rating_params) do
            {
              evaluation: {
                rating: 3,
                evaluation_text: '普通でした'
              }
            }
          end

          it 'アップルカウントが増えない' do
            expect {
              post "/api/promises/#{promise.id}/promise_evaluations", params: low_rating_params, headers: headers
            }.not_to change { partnership.promise_rating_scores.sum(:harvested_apples) }
          end

          it 'PromiseRatingScoreレコードが作成されない' do
            expect {
              post "/api/promises/#{promise.id}/promise_evaluations", params: low_rating_params, headers: headers
            }.not_to change(PromiseRatingScore, :count)
          end
        end
      end

      context '無効なパラメータの場合' do
        let(:invalid_params) do
          {
            evaluation: {
              rating: nil,
              evaluation_text: ''
            }
          }
        end

        it '422ステータスを返す' do
          post "/api/promises/#{promise.id}/promise_evaluations", params: invalid_params, headers: headers
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'エラーメッセージを返す' do
          post "/api/promises/#{promise.id}/promise_evaluations", params: invalid_params, headers: headers
          json = json_response
          expect(json).to have_key('errors')
          expect(json['errors']).to be_an(Array)
        end

        it '評価を作成できない' do
          expect {
            post "/api/promises/#{promise.id}/promise_evaluations", params: invalid_params, headers: headers
          }.not_to change(PromiseEvaluation, :count)
        end

        it 'アップルカウントも増えない' do
          expect {
            post "/api/promises/#{promise.id}/promise_evaluations", params: invalid_params, headers: headers
          }.not_to change { partnership.promise_rating_scores.sum(:harvested_apples) }
        end

        it 'promiseのupdated_atも更新されない' do
          old_updated_at = promise.updated_at
          post "/api/promises/#{promise.id}/promise_evaluations", params: invalid_params, headers: headers
          expect(promise.reload.updated_at).to eq(old_updated_at)
        end
      end
    end

    context '未認証ユーザーの場合' do
      it '401ステータスを返す' do
        post "/api/promises/#{promise.id}/promise_evaluations", params: { evaluation: { rating: 5 } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
