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
    # テストユーザー1でゲストログイン
    guest_user = User.find_by(email: 'test1@example.com')
    
    if guest_user
      token = encode_token(user_id: guest_user.id)
      render json: { 
        token: token,
        message: "ゲストユーザーとしてログインしました"
      }, status: :ok
    else
      render json: { error: "ゲストユーザーが見つかりません" }, status: :not_found
    end
  end
end
