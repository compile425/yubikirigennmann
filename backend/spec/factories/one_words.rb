FactoryBot.define do
  factory :one_word do
    content { Faker::Lorem.sentence }
    association :partnership
    association :sender, factory: :user
    association :receiver, factory: :user
  end
end

