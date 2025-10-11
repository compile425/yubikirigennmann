class Api::PasswordResetsController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :create, :update ]

  # パスワードリセットメールを送信
  def create
    user = User.find_by(email: params[:email])

    if user
      user.generate_password_reset_token
      PasswordResetMailer.reset_email(user).deliver_now
      render json: { message: "パスワードリセットメールを送信しました" }, status: :ok
    else
      # セキュリティのため、メールアドレスが存在しない場合も成功レスポンスを返す
      render json: { message: "パスワードリセットメールを送信しました" }, status: :ok
    end
  rescue => e
    Rails.logger.error "Failed to send password reset email: #{e.message}"
    render json: { error: "メール送信に失敗しました" }, status: :internal_server_error
  end

  # パスワードをリセット
  def update
    user = User.find_by(reset_password_token: params[:token])

    if user.nil?
      render json: { error: "無効なトークンです" }, status: :unprocessable_entity
      return
    end

    unless user.password_reset_token_valid?
      render json: { error: "トークンの有効期限が切れています" }, status: :unprocessable_entity
      return
    end

    # 新しいパスワードを設定
    credential = user.user_credential
    credential.password_digest = BCrypt::Password.create(params[:password])

    if credential.save
      user.clear_password_reset_token
      render json: { message: "パスワードをリセットしました" }, status: :ok
    else
      render json: { error: "パスワードの更新に失敗しました" }, status: :unprocessable_entity
    end
  rescue => e
    Rails.logger.error "Failed to reset password: #{e.message}"
    render json: { error: "パスワードリセットに失敗しました" }, status: :internal_server_error
  end
end
