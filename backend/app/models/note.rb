class Note < ApplicationRecord
    belongs_to :partnership
    belongs_to :sender, class_name: 'User'
  
    has_many :note_read_events
end