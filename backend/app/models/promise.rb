class Promise < ApplicationRecord
    # 関連付け
    belongs_to :partnership
    belongs_to :creator, class_name: 'User'
    has_many :promise_histories, dependent: :destroy
    has_one :promise_evaluation, dependent: :destroy
    
    belongs_to :parent_promise, class_name: 'Promise', optional: true, foreign_key: 'promise_id'
    has_many :child_promises, class_name: 'Promise', foreign_key: 'promise_id'
    
    # バリデーション
    validates :content, presence: true
    validates :promise_type, presence: true
  end