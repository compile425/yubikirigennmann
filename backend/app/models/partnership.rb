class Partnership < ApplicationRecord
    # 関連付け
    has_many :users
    has_one :invitation
    has_many :promises, dependent: :destroy
    has_many :one_words, dependent: :destroy
    has_many :promise_evaluation_monthly_summaries, dependent: :destroy
  
    # Userモデルのuser1_id, user2_idと関連付けるための記述
    belongs_to :user1, class_name: 'User'
    belongs_to :user2, class_name: 'User'
  end