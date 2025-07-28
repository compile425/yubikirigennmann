class Invitation < ApplicationRecord
    # 関連付け
    belongs_to :inviter, class_name: 'User'
    belongs_to :partnership, optional: true
  
    # バリデーション
    validates :invitee_email, presence: true
    validates :token, presence: true, uniqueness: true
  end