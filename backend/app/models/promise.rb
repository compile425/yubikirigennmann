class Promise < ApplicationRecord
    belongs_to :partnership
    belongs_to :creator, class_name: 'User'
  
    has_many :promise_events
    has_many :evaluations
end