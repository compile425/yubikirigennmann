require 'rails_helper'

RSpec.describe RegistrationMailer, type: :mailer do
  let(:user) { create(:user) }

  describe '#welcome_email' do
    let(:mail) { RegistrationMailer.welcome_email(user) }

    it '宛先が正しい' do
      expect(mail.to).to include(user.email)
    end

    it '件名が正しい' do
      expect(mail.subject).to eq('【ゆびきりげんまん】アカウント登録完了のお知らせ')
    end

    it 'ユーザー名が含まれる' do
      body_text = mail.html_part ? mail.html_part.body.to_s : mail.body.to_s
      expect(body_text).to include(user.name)
    end

    it 'メールを送信できる' do
      expect {
        mail.deliver_now
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end
  end
end

