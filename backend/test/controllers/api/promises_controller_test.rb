require "test_helper"

class Api::PromisesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    user = User.create!(email: "test@example.com", name: "Test User")
    payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
    secret = Rails.application.secret_key_base
    token = JWT.encode(payload, secret)

    get api_promises_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success
  end
end
