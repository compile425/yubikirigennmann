require "test_helper"

class Api::PromisesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_promises_index_url
    assert_response :success
  end
end
