require 'rails_helper'

RSpec.describe 'Api::Promises', type: :request do
  let!(:user) { create(:user) }
  let!(:partner) { create(:user) }
  let!(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/promises' do
    context '認証済みユーザーの場合' do
      let!(:promises) { create_list(:promise, 3, partnership: partnership, creator: user) }

      it '200ステータスを返す' do
        get '/api/promises', headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'パートナーシップの約束一覧を返す' do
        get '/api/promises', headers: headers
        json = json_response
        expect(json.length).to eq(3)
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '空配列を返す' do
        get '/api/promises', headers: headers_without_partnership
        json = json_response
        expect(json).to eq([])
      end
    end

    context '未認証ユーザーの場合' do
      it '401ステータスを返す' do
        get '/api/promises'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/promises' do
    context '認証済みユーザーの場合' do
      context '有効なパラメータの場合' do
        let(:valid_params) do
          {
            promise: {
              content: '毎日掃除をする',
              due_date: 7.days.from_now.to_date.to_s,
              type: 'my_promise'
            }
          }
        end

        it '201ステータスを返す' do
          post '/api/promises', params: valid_params, headers: headers
          expect(response).to have_http_status(:created)
        end

        it '作成した約束のデータを返す' do
          post '/api/promises', params: valid_params, headers: headers
          json = json_response
          expect(json['content']).to eq('毎日掃除をする')
          expect(json['type']).to eq('my_promise')
          expect(json['id']).to be_present
        end

        it '作成者IDが含まれる' do
          post '/api/promises', params: valid_params, headers: headers
          json = json_response
          expect(json['creator_id']).to eq(user.id)
        end

        it '約束を作成できる' do
          expect {
            post '/api/promises', params: valid_params, headers: headers
          }.to change(Promise, :count).by(1)
        end

        it 'データベースに約束が保存される' do
          post '/api/promises', params: valid_params, headers: headers
          promise = Promise.last
          expect(promise.content).to eq('毎日掃除をする')
          expect(promise.creator_id).to eq(user.id)
          expect(promise.partnership_id).to eq(partnership.id)
        end
      end

      context 'ふたりの約束の場合' do
        let(:our_promise_params) do
          {
            promise: {
              content: 'ふたりで旅行に行く',
              due_date: 7.days.from_now.to_date.to_s,
              type: 'our_promise'
            }
          }
        end

        it '期日がnilで返される' do
          post '/api/promises', params: our_promise_params, headers: headers
          json = json_response
          expect(json['due_date']).to be_nil
        end

        it '期日がnilでデータベースに保存される' do
          post '/api/promises', params: our_promise_params, headers: headers
          promise = Promise.last
          expect(promise.due_date).to be_nil
          expect(promise.type).to eq('our_promise')
        end
      end

      context '無効なパラメータの場合' do
        let(:invalid_params) do
          {
            promise: {
              content: '',
              type: 'my_promise'
            }
          }
        end

        it '約束を作成できない' do
          expect {
            post '/api/promises', params: invalid_params, headers: headers
          }.not_to change(Promise, :count)
        end

        it '422ステータスを返す' do
          post '/api/promises', params: invalid_params, headers: headers
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    context 'パートナーシップがない場合' do
      let(:user_without_partnership) { create(:user) }
      let(:headers_without_partnership) { auth_headers(user_without_partnership) }

      it '422ステータスを返す' do
        post '/api/promises', params: { promise: { content: 'test', type: 'my_promise' } }, headers: headers_without_partnership
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'PATCH /api/promises/:id' do
    let(:promise) { create(:promise, partnership: partnership, creator: user) }

    context '認証済みユーザーの場合' do
      let(:update_params) do
        {
          promise: {
            content: '更新された内容'
          }
        }
      end

      it '200ステータスを返す' do
        patch "/api/promises/#{promise.id}", params: update_params, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it '更新された約束のデータを返す' do
        patch "/api/promises/#{promise.id}", params: update_params, headers: headers
        json = json_response
        expect(json['content']).to eq('更新された内容')
        expect(json['id']).to eq(promise.id)
      end

      it '約束を更新できる' do
        patch "/api/promises/#{promise.id}", params: update_params, headers: headers
        promise.reload
        expect(promise.content).to eq('更新された内容')
      end

      it 'データベースの値が更新される' do
        old_content = promise.content
        patch "/api/promises/#{promise.id}", params: update_params, headers: headers
        expect(Promise.find(promise.id).content).to eq('更新された内容')
        expect(Promise.find(promise.id).content).not_to eq(old_content)
      end

      it '約束のカウントは変わらない' do
        promise # promiseを事前に作成
        expect {
          patch "/api/promises/#{promise.id}", params: update_params, headers: headers
        }.not_to change(Promise, :count)
      end
    end
  end

  describe 'DELETE /api/promises/:id' do
    let!(:promise) { create(:promise, partnership: partnership, creator: user) }

    context '認証済みユーザーの場合' do
      it '204ステータスを返す' do
        delete "/api/promises/#{promise.id}", headers: headers
        expect(response).to have_http_status(:no_content)
      end

      it 'レスポンスボディが空' do
        delete "/api/promises/#{promise.id}", headers: headers
        expect(response.body).to be_empty
      end

      it '約束を削除できる' do
        expect {
          delete "/api/promises/#{promise.id}", headers: headers
        }.to change(Promise, :count).by(-1)
      end

      it 'データベースから約束が削除される' do
        promise_id = promise.id
        delete "/api/promises/#{promise.id}", headers: headers
        expect(Promise.find_by(id: promise_id)).to be_nil
      end

      it '関連する評価も削除される' do
        create(:promise_evaluation, promise: promise, evaluator: partner, rating: 5)

        expect {
          delete "/api/promises/#{promise.id}", headers: headers
        }.to change(PromiseEvaluation, :count).by(-1)
      end
    end
  end
end
