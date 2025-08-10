class User < ApplicationRecord
  has_one :user_credential, dependent: :destroy
  has_many :partnerships_as_user, class_name: 'Partnership', foreign_key: 'user_id', dependent: :destroy
  has_many :partnerships_as_partner, class_name: 'Partnership', foreign_key: 'partner_id', dependent: :destroy
  has_many :created_promises, class_name: 'Promise', foreign_key: 'creator_id', dependent: :destroy
  has_many :evaluated_promises, class_name: 'PromiseEvaluation', foreign_key: 'evaluator_id', dependent: :destroy
  has_many :sent_one_words, class_name: 'OneWord', foreign_key: 'sender_id', dependent: :destroy
  has_many :read_one_words, class_name: 'OneWordRead', foreign_key: 'reader_id', dependent: :destroy
  has_many :sent_invitations, class_name: 'Invitation', foreign_key: 'inviter_id', dependent: :destroy
  has_many :invitations, foreign_key: 'inviter_id', dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  def partnership
    partnerships_as_user.first || partnerships_as_partner.first
  end
end