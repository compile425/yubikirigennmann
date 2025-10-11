class User < ApplicationRecord
  has_one :user_credential, dependent: :destroy
  has_many :partnerships_as_user, class_name: "Partnership", foreign_key: "user_id", dependent: :destroy
  has_many :partnerships_as_partner, class_name: "Partnership", foreign_key: "partner_id", dependent: :destroy
  has_many :created_promises, class_name: "Promise", foreign_key: "creator_id", dependent: :destroy
  has_many :evaluated_promises, class_name: "PromiseEvaluation", foreign_key: "evaluator_id", dependent: :destroy
  has_many :sent_one_words, class_name: "OneWord", foreign_key: "sender_id", dependent: :destroy
  has_many :read_one_words, class_name: "OneWordRead", foreign_key: "reader_id", dependent: :destroy
  has_many :invitation_codes, foreign_key: "inviter_id", dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  def partnership
    partnerships_as_user.first || partnerships_as_partner.first
  end

  # パスワードリセットトークンを生成
  def generate_password_reset_token
    self.reset_password_token = SecureRandom.urlsafe_base64
    self.reset_password_sent_at = Time.current
    save(validate: false)
  end

  # パスワードリセットトークンの有効期限チェック（2時間）
  def password_reset_token_valid?
    reset_password_sent_at.present? && reset_password_sent_at > 2.hours.ago
  end

  # パスワードリセットトークンをクリア
  def clear_password_reset_token
    self.reset_password_token = nil
    self.reset_password_sent_at = nil
    save(validate: false)
  end
end
