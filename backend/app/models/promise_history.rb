class PromiseHistory < ApplicationRecord
    belongs_to :promise
    belongs_to :editor, class_name: "User"
end
