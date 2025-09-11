require "test_helper"

class Api::PromisesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    user = users(:one) if defined?(users)
    token = ApplicationController.new.encode_token(user_id: user&.id || 1)
    get api_promises_url, headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success
  end
end
