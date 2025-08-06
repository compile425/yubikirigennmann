class Partnership < ApplicationRecord
  has_many :users
  has_many :promises, dependent: :destroy
  has_many :one_words, dependent: :destroy
  has_many :monthly_summaries, dependent: :destroy
  belongs_to :invitation, optional: true
  belongs_to :user, class_name: 'User', foreign_key: 'user_id'
  belongs_to :partner, class_name: 'User', foreign_key: 'partner_id'
end
    