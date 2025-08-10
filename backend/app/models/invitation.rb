class Invitation < ApplicationRecord
    belongs_to :inviter, class_name: 'User'
  
    validates :token, presence: true, uniqueness: true
  end