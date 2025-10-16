FactoryBot.define do
  factory :partnership do
    association :user
    association :partner, factory: :user

    trait :with_promises do
      after(:create) do |partnership|
        create_list(:promise, 3, partnership: partnership, creator: partnership.user)
        create_list(:promise, 2, :our_promise, partnership: partnership, creator: partnership.user)
      end
    end
  end
end

