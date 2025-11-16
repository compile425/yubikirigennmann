class ApplicationMailer < ActionMailer::Base
  default from: "ゆびきりげんまん <#{ENV.fetch('SES_VERIFIED_SENDER', 'no-reply@yubikirigenman.com')}>"
  layout "mailer"
end
