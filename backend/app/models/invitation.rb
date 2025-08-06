class Invitation < ApplicationRecord
    belongs_to :inviter, class_name: 'User'

    validates :invitee_email, presence: true
    validates :token, presence: true, uniqueness: true
end