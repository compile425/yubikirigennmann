class PasswordResetMailer < ApplicationMailer
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
