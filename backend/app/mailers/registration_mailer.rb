class RegistrationMailer < ApplicationMailer
  def welcome_email(user)
  @user = user
  @login_url = "http://localhost:3000"

  mail(
    to: user.email,
    subject: "【ゆびきりげんまん】アカウント登録完了のお知らせ"
  )
  end
end
