require 'rails_helper'

RSpec.describe UserCredential, type: :model do
  describe 'has_secure_password' do
    let(:user) { create(:user) }
    let(:credential) { user.user_credential }

    it 'パスワードを認証できる' do
      expect(credential.authenticate('password123')).to be_truthy
    end

    it '間違ったパスワードは認証されない' do
      expect(credential.authenticate('wrongpassword')).to be_falsey
    end

    it 'password_digestが保存される' do
      expect(credential.password_digest).to be_present
      expect(credential.password_digest).not_to eq('password123')
    end
  end
end
