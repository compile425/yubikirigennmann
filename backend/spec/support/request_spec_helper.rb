module RequestSpecHelper
  # 認証用のヘルパーメソッド
  def auth_headers(user)
    token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
    { 'Authorization' => "Bearer #{token}" }
  end

  # JSONレスポンスをパースするヘルパー
  def json_response
    JSON.parse(response.body)
  end
end

