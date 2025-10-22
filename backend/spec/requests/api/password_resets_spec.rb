require 'rails_helper'

RSpec.describe 'Api::PasswordResets', type: :request do
  describe 'POST /api/password-resets' do
    let!(:user) { create(:user) }

    context 'ユーザーが存在する場合' do
      let(:params) { { email: user.email } }

      it '200ステータスを返す' do
        post '/api/password-resets', params: params
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを返す' do
        post '/api/password-resets', params: params
        json = json_response
        expect(json['message']).to eq('パスワードリセットメールを送信しました')
      end

      it 'リセットトークンが生成される' do
        post '/api/password-resets', params: params
        user.reload
        expect(user.reset_password_token).to be_present
        expect(user.reset_password_sent_at).to be_present
      end

      it 'メールが送信される' do
        expect {
          post '/api/password-resets', params: params
        }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      it '送信されるメールの宛先が正しい' do
        post '/api/password-resets', params: params
        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to include(user.email)
      end
    end

    context 'ユーザーが存在しない場合' do
      let(:params) { { email: 'nonexistent@example.com' } }

      it '200ステータスを返す' do
        post '/api/password-resets', params: params
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを返す' do
        post '/api/password-resets', params: params
        json = json_response
        expect(json['message']).to eq('パスワードリセットメールを送信しました')
      end

      it 'メールが送信されない' do
        expect {
          post '/api/password-resets', params: params
        }.not_to change { ActionMailer::Base.deliveries.count }
      end
    end
  end

  describe 'PUT /api/password-resets' do
    let!(:user) { create(:user) }

    before do
      user.generate_password_reset_token
    end

    context '有効なトークンの場合' do
      let(:params) do
        {
          token: user.reset_password_token,
          password: 'newpassword123'
        }
      end

      it '200ステータスを返す' do
        put '/api/password-resets', params: params
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを返す' do
        put '/api/password-resets', params: params
        json = json_response
        expect(json['message']).to eq('パスワードをリセットしました')
      end

      it 'パスワードが更新される' do
        put '/api/password-resets', params: params
        user.reload
        expect(user.user_credential.authenticate('newpassword123')).to be_truthy
      end

      it 'リセットトークンがクリアされる' do
        put '/api/password-resets', params: params
        user.reload
        expect(user.reset_password_token).to be_nil
        expect(user.reset_password_sent_at).to be_nil
      end
    end

    context '無効なトークンの場合' do
      let(:params) do
        {
          token: 'invalid_token',
          password: 'newpassword123'
        }
      end

      it '422ステータスを返す' do
        put '/api/password-resets', params: params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'エラーメッセージを返す' do
        put '/api/password-resets', params: params
        json = json_response
        expect(json['error']).to eq('無効なトークンです')
      end

      it 'パスワードが更新されない' do
        old_password_digest = user.user_credential.password_digest
        put '/api/password-resets', params: params
        user.reload
        expect(user.user_credential.password_digest).to eq(old_password_digest)
      end
    end

    context 'トークンの有効期限が切れている場合' do
      before do
        user.update(reset_password_sent_at: 3.hours.ago)
      end

      let(:params) do
        {
          token: user.reset_password_token,
          password: 'newpassword123'
        }
      end

      it '422ステータスを返す' do
        put '/api/password-resets', params: params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'エラーメッセージを返す' do
        put '/api/password-resets', params: params
        json = json_response
        expect(json['error']).to eq('トークンの有効期限が切れています')
      end
    end
  end
end
