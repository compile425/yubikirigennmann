class PromiseHistory < ApplicationRecord
    # 関連付け
    belongs_to :promise
    belongs_to :editor, class_name: 'User'
  end