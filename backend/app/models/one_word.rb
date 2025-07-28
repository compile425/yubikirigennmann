class OneWord < ApplicationRecord
    # 関連付け
    belongs_to :partnership
    belongs_to :sender, class_name: 'User'
    has_many :one_word_reads, dependent: :destroy
  
    # バリデーション
    validates :content, presence: true
  end