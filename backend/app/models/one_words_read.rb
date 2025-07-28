class OneWordRead < ApplicationRecord
    # 関連付け
    belongs_to :one_word
    belongs_to :reader, class_name: 'User'
  end