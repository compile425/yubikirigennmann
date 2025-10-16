require 'rails_helper'

RSpec.describe PasswordResetMailer, type: :mailer do
  let(:user) { create(:user) }

  before do
    user.generate_password_reset_token
  end

  describe '#reset_email' do
    let(:mail) { PasswordResetMailer.reset_email(user) }

    it '宛先が正しい' do
      expect(mail.to).to include(user.email)
    end

    it '件名が正しい' do
      expect(mail.subject).to eq('【ゆびきりげんまん】パスワードリセットのご案内')
    end

    it 'リセットトークンが含まれる' do
      expect(mail.html_part.body.to_s).to include(user.reset_password_token)
    end

    it 'リセットURLが含まれる' do
      expect(mail.html_part.body.to_s).to include('password-reset')
    end

    it 'メールを送信できる' do
      expect {
        mail.deliver_now
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end
  end
end

