class PasswordResetMailer < ApplicationMailer
  default from: ENV["MAILER_FROM"] || "noreply@yubikirigennmann.com"

  def reset_email(user)
  @user = user
  @reset_url = "#{ENV['FRONTEND_URL'] || 'http://localhost:5173'}/password-reset?token=#{user.reset_password_token}"

  mail(
    to: user.email,
    subject: "【ゆびきりげんまん】パスワードリセットのご案内"
  )
  end
end
