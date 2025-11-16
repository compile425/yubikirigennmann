class PasswordResetMailer < ApplicationMailer
  # ApplicationMailerで送信元名が設定されているため、個別の設定は不要

  def reset_email(user)
    @user = user
    frontend_url = ENV["FRONTEND_URL"] || ENV["APP_HOST"] || "http://localhost:5173"
    @reset_url = "#{frontend_url}/password-reset?token=#{user.reset_password_token}"

    mail(
      to: user.email,
      subject: "【ゆびきりげんまん】パスワードリセットのご案内"
    )
  end
end
