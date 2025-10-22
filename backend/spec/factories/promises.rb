FactoryBot.define do
  factory :promise do
    content { Faker::Lorem.sentence }
    due_date { 7.days.from_now.to_date }
    type { "my_promise" }
    association :partnership
    association :creator, factory: :user

    trait :our_promise do
      type { "our_promise" }
      due_date { nil }
    end

    trait :partner_promise do
      type { "partner_promise" }
    end

    trait :with_evaluation do
      after(:create) do |promise|
        evaluator = if promise.creator == promise.partnership.user
          promise.partnership.partner
        else
          promise.partnership.user
        end
        create(:promise_evaluation, promise: promise, evaluator: evaluator)
      end
    end

    trait :overdue do
      due_date { 1.day.from_now.to_date }

      after(:create) do |promise|
        promise.update_column(:due_date, 1.day.ago.to_date)
      end
    end
  end
end
