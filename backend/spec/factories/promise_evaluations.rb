FactoryBot.define do
  factory :promise_evaluation do
    rating { rand(1..5) }
    evaluation_text { Faker::Lorem.paragraph }
    association :promise
    association :evaluator, factory: :user

    trait :high_rating do
      rating { 5 }
    end

    trait :low_rating do
      rating { 1 }
    end
  end
end

