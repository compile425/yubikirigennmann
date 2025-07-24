class Evaluation < ApplicationRecord
    belongs_to :promise
    belongs_to :evaluator, class_name: 'User'
end