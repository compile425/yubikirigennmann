class Api::SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :create, :guest_login ]

  def create
    user = User.find_by(email: params[:email])

    if user&.user_credential&.authenticate(params[:password])
      token = encode_token(user_id: user.id)
      render json: { token: token }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def guest_login
    guest_user = User.find_or_create_by!(email: "test1@example.com") do |u|
      u.name = "テストユーザー1"
    end
    UserCredential.find_or_create_by!(user: guest_user) do |cred|
      cred.password = "password123"
      cred.password_confirmation = "password123"
    end

    token = encode_token(user_id: guest_user.id)
    render json: { token:, message: "ゲストユーザーとしてログインしました" }, status: :ok
  end
end
