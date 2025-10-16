FactoryBot.define do
  factory :promise_rating_score do
    association :partnership
    year_month { Date.current.beginning_of_month }
    harvested_apples { 0 }
  end
end

