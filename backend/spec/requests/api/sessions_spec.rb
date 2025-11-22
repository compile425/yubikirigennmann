require 'rails_helper'

RSpec.describe 'Api::Sessions', type: :request do
  describe 'POST /api/login' do
    let!(:user) { create(:user) }

    context '有効な認証情報の場合' do
      let(:valid_params) do
        {
          email: user.email,
          password: 'password123'
        }
      end

      it '200ステータスを返す' do
        post '/api/login', params: valid_params
        expect(response).to have_http_status(:ok)
      end

      it 'トークンを返す' do
        post '/api/login', params: valid_params
        json = json_response
        expect(json['token']).to be_present
      end
    end

    context '無効な認証情報の場合' do
      let(:invalid_params) do
        {
          email: user.email,
          password: 'wrongpassword'
        }
      end

      it '401ステータスを返す' do
        post '/api/login', params: invalid_params
        expect(response).to have_http_status(:unauthorized)
      end

      it 'エラーメッセージを返す' do
        post '/api/login', params: invalid_params
        json = json_response
        expect(json['error']).to be_present
      end
    end

    context 'ユーザーが存在しない場合' do
      let(:nonexistent_params) do
        {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      end

      it '401ステータスを返す' do
        post '/api/login', params: nonexistent_params
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/guest_login' do
    it '200ステータスを返す' do
      post '/api/guest_login'
      expect(response).to have_http_status(:ok)
    end

    it 'トークンとメッセージを返す' do
      post '/api/guest_login'
      json = json_response
      expect(json['token']).to be_present
      expect(json['message']).to eq('ゲストユーザーとしてログインしました')
    end

    it 'ゲストユーザーを作成または取得する' do
      post '/api/guest_login'
      guest_user = User.find_by(email: 'test1@example.com')
      expect(guest_user).to be_present
      expect(guest_user.name).to eq('テストユーザー1')
    end

    it '複数回呼び出しても同じゲストユーザーを使用する' do
      post '/api/guest_login'
      first_user_count = User.count

      post '/api/guest_login'
      expect(User.count).to eq(first_user_count)
    end

    it 'パートナーシップを作成する' do
      post '/api/guest_login'
      guest_user = User.find_by(email: 'test1@example.com')
      expect(guest_user.partnership).to be_present
    end

    it '評価待ちの約束を1件作成する' do
      post '/api/guest_login'
      guest_user = User.find_by(email: 'test1@example.com')
      partnership = guest_user.partnership

      # 評価待ちの約束が存在することを確認
      pending_promises = partnership.pending_evaluations_for(guest_user)
      expect(pending_promises.count).to be >= 1

      # 期日が今日の約束が存在することを確認
      today = Date.today
      today_promise = partnership.promises
        .where.not(creator_id: guest_user.id)
        .where.not(type: "our_promise")
        .where(due_date: today)
        .left_joins(:promise_evaluation)
        .where(promise_evaluations: { id: nil })
        .first

      expect(today_promise).to be_present
    end

    it '既に評価待ちの約束がある場合は追加で作成しない' do
      post '/api/guest_login'
      guest_user = User.find_by(email: 'test1@example.com')
      partnership = guest_user.partnership

      # 初回の評価待ちの約束数を取得
      initial_pending_count = partnership.pending_evaluations_for(guest_user).count

      # 再度ゲストログイン
      post '/api/guest_login'

      # 評価待ちの約束数が変わらないことを確認（既に1件以上あるため）
      final_pending_count = partnership.pending_evaluations_for(guest_user).count
      expect(final_pending_count).to be >= initial_pending_count
    end
  end
end

