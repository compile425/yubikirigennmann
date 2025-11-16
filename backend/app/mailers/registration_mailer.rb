class RegistrationMailer < ApplicationMailer
  def welcome_email(user)
    @user = user
    @login_url = ENV["FRONTEND_URL"] || ENV["APP_HOST"] || "http://localhost:3000"

    mail(
      to: user.email,
      subject: "【ゆびきりげんまん】アカウント登録完了のお知らせ"
    )
  end
end
