class OneWordRead < ApplicationRecord
    belongs_to :one_word
    belongs_to :reader, class_name: 'User'
end