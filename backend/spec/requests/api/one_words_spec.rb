require 'rails_helper'

RSpec.describe 'Api::OneWords', type: :request do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let!(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/one_words' do
    context '認証済みユーザーの場合' do
      let!(:received_word1) { create(:one_word, partnership: partnership, sender: partner, receiver: user) }
      let!(:received_word2) { create(:one_word, partnership: partnership, sender: partner, receiver: user) }
      let!(:sent_word) { create(:one_word, partnership: partnership, sender: user, receiver: partner) }

      it '200ステータスを返す' do
        get '/api/one_words', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '受信した一言のみを返す' do
        get '/api/one_words', headers: headers
        json = json_response
        expect(json.length).to eq(2)
      end

      context '年月パラメータがある場合' do
        before do
          received_word1.update(created_at: Date.new(2025, 1, 15))
          received_word2.update(created_at: Date.new(2025, 2, 10))
        end

        it '指定された年月の一言のみを返す' do
          get '/api/one_words', params: { year: 2025, month: 1 }, headers: headers
          json = json_response
          expect(json.length).to eq(1)
          expect(json.first['id']).to eq(received_word1.id)
        end
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '空配列を返す' do
        get '/api/one_words', headers: headers_without_partnership
        json = json_response
        expect(json).to eq([])
      end
    end
  end

  describe 'POST /api/one_words' do
    context '認証済みユーザーの場合' do
      let(:valid_params) do
        {
          one_word: {
            content: 'ありがとう！'
          }
        }
      end

      it '一言を作成できる' do
        expect {
          post '/api/one_words', params: valid_params, headers: headers
        }.to change(OneWord, :count).by(1)
      end

      it '201ステータスを返す' do
        post '/api/one_words', params: valid_params, headers: headers
        expect(response).to have_http_status(:created)
      end

      it '送信者と受信者が正しく設定される' do
        post '/api/one_words', params: valid_params, headers: headers
        one_word = OneWord.last
        expect(one_word.sender).to eq(user)
        expect(one_word.receiver).to eq(partner)
      end

      context '無効なパラメータの場合' do
        let(:invalid_params) do
          {
            one_word: {
              content: ''
            }
          }
        end

        it '一言を作成できない' do
          expect {
            post '/api/one_words', params: invalid_params, headers: headers
          }.not_to change(OneWord, :count)
        end

        it '422ステータスを返す' do
          post '/api/one_words', params: invalid_params, headers: headers
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end
  end
end

