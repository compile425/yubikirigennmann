class Partnership < ApplicationRecord
    has_many :users
    has_many :promises
    has_many :notes
    has_many :monthly_summaries
end