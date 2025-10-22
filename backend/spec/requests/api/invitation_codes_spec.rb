require 'rails_helper'

RSpec.describe 'Api::InvitationCodes', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'POST /api/invitation-codes' do
    context '認証済みユーザーの場合' do
      context 'パートナーシップがない場合' do
        it '招待コードを作成できる' do
          expect {
            post '/api/invitation-codes', headers: headers
          }.to change(InvitationCode, :count).by(1)
        end

        it '201ステータスを返す' do
          post '/api/invitation-codes', headers: headers
          expect(response).to have_http_status(:created)
        end

        it '招待コードを返す' do
          post '/api/invitation-codes', headers: headers
          json = json_response
          expect(json['invitation_code']).to be_present
          expect(json['invitation_code'].length).to eq(8)
        end

        context '既存のアクティブな招待コードがある場合' do
          let!(:existing_code) { create(:invitation_code, inviter: user) }

          it '既存のコードを削除して新しいコードを作成する' do
            expect {
              post '/api/invitation-codes', headers: headers
            }.to change(InvitationCode, :count).by(0) # 1つ削除、1つ作成
          end
        end
      end

      context '既にパートナーシップがある場合' do
        let(:partner) { create(:user) }
        let!(:partnership) { create(:partnership, user: user, partner: partner) }

        it '422ステータスを返す' do
          post '/api/invitation-codes', headers: headers
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end
  end

  describe 'POST /api/join-partnership' do
    let(:inviter) { create(:user) }
    let(:invitation_code) { create(:invitation_code, inviter: inviter) }

    context '有効な招待コードの場合' do
      let(:params) { { invitation_code: invitation_code.code } }

      it 'パートナーシップを作成できる' do
        expect {
          post '/api/join-partnership', params: params, headers: headers
        }.to change(Partnership, :count).by(1)
      end

      it 'デフォルトの約束が作成される' do
        post '/api/join-partnership', params: params, headers: headers
        partnership = Partnership.last
        expect(partnership.promises.count).to eq(3)
      end

      it '招待コードが使用済みになる' do
        post '/api/join-partnership', params: params, headers: headers
        expect(invitation_code.reload.used).to be true
      end

      it '200ステータスを返す' do
        post '/api/join-partnership', params: params, headers: headers
        expect(response).to have_http_status(:ok)
      end
    end

    context '無効な招待コードの場合' do
      let(:params) { { invitation_code: 'INVALID1' } }

      it '404ステータスを返す' do
        post '/api/join-partnership', params: params, headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context '招待コードが空の場合' do
      let(:params) { { invitation_code: '' } }

      it '422ステータスを返す' do
        post '/api/join-partnership', params: params, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context '自分の招待コードを使う場合' do
      let(:self_code) { create(:invitation_code, inviter: user) }
      let(:params) { { invitation_code: self_code.code } }

      it '422ステータスを返す' do
        post '/api/join-partnership', params: params, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
