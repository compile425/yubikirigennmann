class User < ApplicationRecord
    has_secure_password
    belongs_to :partnership

    has_many :created_promises, class_name: 'Promise', foreign_key: 'creator_id'
    has_many :evaluations, foreign_key: 'evaluator_id'
    has_many :sent_notes, class_name: 'Note', foreign_key: 'sender_id'
    has_many :note_read_events, foreign_key: 'reader_id'
end