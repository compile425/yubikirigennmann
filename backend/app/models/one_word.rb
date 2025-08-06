class OneWord < ApplicationRecord
    belongs_to :partnership
    belongs_to :sender, class_name: 'User'
    has_many :one_word_reads, dependent: :destroy

    validates :content, presence: true
end