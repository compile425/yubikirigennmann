class Api::PasswordResetsController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :create, :update ]

  # パスワードリセットメールを送信
  def create
    user = User.find_by(email: params[:email])

    if user
      user.send_password_reset_email!
    end

    # セキュリティのため、メールアドレスが存在しない場合も成功レスポンスを返す
    render json: { message: "パスワードリセットメールを送信しました" }, status: :ok
  rescue => e
    Rails.logger.error "Failed to send password reset email: #{e.message}"
    render json: { error: "メール送信に失敗しました" }, status: :internal_server_error
  end

  # パスワードをリセット
  def update
    user = User.find_by(reset_password_token: params[:token])

    unless user
      render json: { error: "無効なトークンです" }, status: :unprocessable_entity
      return
    end

    user.reset_password!(params[:password])
    render json: { message: "パスワードをリセットしました" }, status: :ok
  rescue ArgumentError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: "パスワードの更新に失敗しました" }, status: :unprocessable_entity
  rescue => e
    Rails.logger.error "Failed to reset password: #{e.message}"
    render json: { error: "パスワードリセットに失敗しました" }, status: :internal_server_error
  end
end
