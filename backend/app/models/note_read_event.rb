class NoteReadEvent < ApplicationRecord
    belongs_to :note
    belongs_to :reader, class_name: 'User'
end