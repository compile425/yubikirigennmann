require 'rails_helper'

RSpec.describe 'Api::Partnerships', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let!(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:headers) { auth_headers(user) }

  describe 'DELETE /api/partnerships/dissolve' do
    context '認証済みユーザーの場合' do
      it 'パートナーシップを解消できる' do
        expect {
          delete '/api/partnerships/dissolve', headers: headers
        }.to change(Partnership, :count).by(-1)
      end

      it '関連する約束も削除される' do
        create_list(:promise, 3, partnership: partnership, creator: user)

        expect {
          delete '/api/partnerships/dissolve', headers: headers
        }.to change(Promise, :count).by(-3)
      end

      it '200ステータスを返す' do
        delete '/api/partnerships/dissolve', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを返す' do
        delete '/api/partnerships/dissolve', headers: headers
        json = json_response
        expect(json['message']).to eq('パートナーシップを解消しました')
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '404ステータスを返す' do
        delete '/api/partnerships/dissolve', headers: headers_without_partnership
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/partnerships/create_default_promises' do
    context '認証済みユーザーの場合' do
      it 'デフォルトの約束を作成できる' do
        expect {
          post '/api/partnerships/create_default_promises', headers: headers
        }.to change { partnership.promises.count }.by(3)
      end

      it '200ステータスを返す' do
        post '/api/partnerships/create_default_promises', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを返す' do
        post '/api/partnerships/create_default_promises', headers: headers
        json = json_response
        expect(json['message']).to eq('デフォルトの約束を作成しました')
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '404ステータスを返す' do
        post '/api/partnerships/create_default_promises', headers: headers_without_partnership
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
