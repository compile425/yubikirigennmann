require 'rails_helper'

RSpec.describe 'Api::Users', type: :request do
  describe 'POST /api/register' do
    let(:valid_params) do
      {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        },
        user_credential: {
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
    end

    it 'ユーザーを作成できる' do
      expect {
        post '/api/register', params: valid_params
      }.to change(User, :count).by(1)
    end

    it '認証情報も作成される' do
      expect {
        post '/api/register', params: valid_params
      }.to change(UserCredential, :count).by(1)
    end

    it '201ステータスを返す' do
      post '/api/register', params: valid_params
      expect(response).to have_http_status(:created)
    end

    it 'トークンとユーザー情報を返す' do
      post '/api/register', params: valid_params
      json = json_response
      expect(json['token']).to be_present
      expect(json['user']['name']).to eq('Test User')
      expect(json['user']['email']).to eq('test@example.com')
    end

    context '無効なパラメータの場合' do
      let(:invalid_params) do
        {
          user: {
            name: '',
            email: 'invalid'
          },
          user_credential: {
            password: 'pass',
            password_confirmation: 'pass'
          }
        }
      end

      it 'ユーザーを作成できない' do
        expect {
          post '/api/register', params: invalid_params
        }.not_to change(User, :count)
      end

      it '422ステータスを返す' do
        post '/api/register', params: invalid_params
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'GET /api/get_me' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let!(:partnership) { create(:partnership, user: user, partner: partner) }
    let(:headers) { auth_headers(user) }

    context '認証済みユーザーの場合' do
      it '200ステータスを返す' do
        get '/api/get_me', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'ユーザー情報とパートナー情報を返す' do
        get '/api/get_me', headers: headers
        json = json_response
        expect(json['current_user']['id']).to eq(user.id)
        expect(json['partner']['id']).to eq(partner.id)
      end
    end

    context '未認証ユーザーの場合' do
      it '401ステータスを返す' do
        get '/api/get_me'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/user_stats' do
    let(:user) { create(:user) }
    let(:partner) { create(:user) }
    let!(:partnership) { create(:partnership, user: user, partner: partner) }
    let(:headers) { auth_headers(user) }

    context '認証済みユーザーの場合' do
      it '200ステータスを返す' do
        get '/api/user_stats', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '招待者と被招待者の統計情報を返す' do
        get '/api/user_stats', headers: headers
        json = json_response
        expect(json).to have_key('inviter')
        expect(json).to have_key('invitee')
        expect(json).to have_key('monthly_apple_count')
      end

      it '平均スコアとトレンドが含まれる' do
        get '/api/user_stats', headers: headers
        json = json_response
        expect(json['inviter']).to have_key('average_score')
        expect(json['inviter']).to have_key('score_trend')
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '422ステータスを返す' do
        get '/api/user_stats', headers: headers_without_partnership
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
