require 'rails_helper'

RSpec.describe 'Api::EvaluationEmails', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let!(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:headers) { auth_headers(user) }

  describe 'POST /api/evaluation_emails' do
    context '認証済みユーザーの場合' do
      context 'ふたりの約束がある場合' do
        let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

        it '200ステータスを返す' do
          post '/api/evaluation_emails', headers: headers
          expect(response).to have_http_status(:ok)
        end

        it '成功メッセージと詳細情報を返す' do
          post '/api/evaluation_emails', headers: headers
          json = json_response
          expect(json['message']).to eq('評価メールを送信しました')
          expect(json['promise']).to be_present
          expect(json['partner']).to be_present
          expect(json['sender']).to be_present
        end

        it '約束IDが含まれる' do
          post '/api/evaluation_emails', headers: headers
          json = json_response
          expect(json['promise']['id']).to eq(our_promise.id)
        end

        it 'メールが送信される' do
          expect {
            post '/api/evaluation_emails', headers: headers
          }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end

        it 'パートナーにメールが送信される' do
          post '/api/evaluation_emails', headers: headers
          mail = ActionMailer::Base.deliveries.last
          expect(mail.to).to include(partner.email)
        end
      end

      context 'ふたりの約束がない場合' do
        it '404ステータスを返す' do
          post '/api/evaluation_emails', headers: headers
          expect(response).to have_http_status(:not_found)
        end

        it 'エラーメッセージを返す' do
          post '/api/evaluation_emails', headers: headers
          json = json_response
          expect(json['error']).to eq('評価対象の約束が見つかりません')
        end

        it 'メールが送信されない' do
          expect {
            post '/api/evaluation_emails', headers: headers
          }.not_to change { ActionMailer::Base.deliveries.count }
        end
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '422ステータスを返す' do
        post '/api/evaluation_emails', headers: headers_without_partnership
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
