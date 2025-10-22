class PromiseEvaluation < ApplicationRecord
  belongs_to :promise
  belongs_to :evaluator, class_name: "User"

  validates :rating, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
end
