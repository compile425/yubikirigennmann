class Promise < ApplicationRecord
    self.inheritance_column = :_type_disabled
    belongs_to :partnership
    belongs_to :creator, class_name: 'User'
    has_many :promise_histories, dependent: :destroy
    has_one :promise_evaluation, dependent: :destroy
    
    belongs_to :parent_promise, class_name: 'Promise', optional: true, foreign_key: 'promise_id'
    has_many :child_promises, class_name: 'Promise', foreign_key: 'promise_id'

    validates :content, presence: true
    validates :type, presence: true
    
    after_validation :log_validation_errors
    
    private
    
    def log_validation_errors
      if errors.any?
        Rails.logger.error "Promise validation errors: #{errors.full_messages}"
      end
    end
end