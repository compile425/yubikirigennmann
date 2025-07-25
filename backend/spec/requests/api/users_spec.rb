require 'rails_helper'

RSpec.describe "Api::Users", type: :request do
  describe "POST /api/users" do
    let(:headers) { { "Content-Type" => "application/json" } }
    context "パラメータが正常な場合" do
      it "ユーザーが正常に作成されること" do
        user_params = { 
          user: { 
            name: "Test User", 
            email: "test@example.com", 
            password: "password", 
            password_confirmation: "password"
          }
        }
        expect { 
          post '/api/users', 
          params: user_params.to_json,
          headers: headers 
        }.to change(User, :count).by(1)
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['name']).to eq('Test User')
        expect(json['email']).to eq('test@example.com')
      end
    end

    context "パラメータが不正な場合" do
      it "エラーが返され、ユーザーが作成されないこと" do
        user_params = { 
          user: { 
            name: "Test User", 
            email: "test@example.com", 
            password: "password", 
            password_confirmation: "wrong_password"
          }
        }
        expect { 
          post '/api/users', 
          params: user_params.to_json,
          headers: headers 
        }.to_not change(User, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to include("Password confirmation doesn't match Password")
      end
    end
  end
end