FactoryBot.define do
  factory :invitation_code do
    association :inviter, factory: :user
    used { false }

    trait :used do
      used { true }
    end
  end
end
