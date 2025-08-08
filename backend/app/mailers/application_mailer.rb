class ApplicationMailer < ActionMailer::Base
  default from: ENV['MAILER_FROM'] || 'yubikirigennmann@gmail.com'
  layout 'mailer'
end
