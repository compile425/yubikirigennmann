FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    name { Faker::Name.name }

    after(:create) do |user|
      user.create_user_credential(
        password: "password123",
        password_confirmation: "password123"
      )
    end
  end
end
