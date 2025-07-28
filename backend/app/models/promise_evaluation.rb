class PromiseEvaluation < ApplicationRecord
    # 関連付け
    belongs_to :promise
    belongs_to :evaluator, class_name: 'User'
  
    # バリデーション
    validates :score, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
  end