require 'rails_helper'

RSpec.describe 'Api::EvaluationPages', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:promise) { create(:promise, partnership: partnership, creator: user) }

  describe 'GET /api/evaluation_pages/:id' do
    context '有効なトークンの場合' do
      let(:token) do
        JWT.encode(
          { promise_id: promise.id, exp: 1.week.from_now.to_i },
          Rails.application.secret_key_base
        )
      end

      it '200ステータスを返す' do
        get "/api/evaluation_pages/#{promise.id}", params: { token: token }
        expect(response).to have_http_status(:ok)
      end

      it '約束データとvalid_tokenフラグを返す' do
        get "/api/evaluation_pages/#{promise.id}", params: { token: token }
        json = json_response
        expect(json['promise']).to be_present
        expect(json['valid_token']).to be true
        expect(json['promise']['id']).to eq(promise.id)
      end

      it '約束の内容が含まれる' do
        get "/api/evaluation_pages/#{promise.id}", params: { token: token }
        json = json_response
        expect(json['promise']['content']).to eq(promise.content)
      end
    end

    context '無効なトークンの場合' do
      let(:invalid_token) { 'invalid_token_string' }

      it '401ステータスを返す' do
        get "/api/evaluation_pages/#{promise.id}", params: { token: invalid_token }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'エラーメッセージとvalid_tokenフラグを返す' do
        get "/api/evaluation_pages/#{promise.id}", params: { token: invalid_token }
        json = json_response
        expect(json['error']).to eq('無効なトークンです')
        expect(json['valid_token']).to be false
      end
    end

    context '期限切れのトークンの場合' do
      let(:expired_token) do
        JWT.encode(
          { promise_id: promise.id, exp: 1.day.ago.to_i },
          Rails.application.secret_key_base
        )
      end

      it '401ステータスを返す' do
        get "/api/evaluation_pages/#{promise.id}", params: { token: expired_token }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context '存在しない約束IDの場合' do
      let(:token) do
        JWT.encode(
          { promise_id: 999999, exp: 1.week.from_now.to_i },
          Rails.application.secret_key_base
        )
      end

      it '401ステータスを返す' do
        get "/api/evaluation_pages/999999", params: { token: token }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

