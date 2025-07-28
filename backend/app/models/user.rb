class User < ApplicationRecord
    # 関連付け
    belongs_to :partnership, optional: true
    has_many :created_promises, class_name: 'Promise', foreign_key: 'creator_id', dependent: :destroy
    has_many :evaluated_promises, class_name: 'PromiseEvaluation', foreign_key: 'evaluator_id', dependent: :destroy
    has_many :sent_one_words, class_name: 'OneWord', foreign_key: 'sender_id', dependent: :destroy
    has_many :read_one_words, class_name: 'OneWordRead', foreign_key: 'reader_id', dependent: :destroy
  
    # 招待した側としての関連
    has_many :sent_invitations, class_name: 'Invitation', foreign_key: 'inviter_id', dependent: :destroy
    
    # バリデーション
    validates :email, presence: true, uniqueness: true
    validates :name, presence: true
  end