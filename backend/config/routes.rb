Rails.application.routes.draw do
  # letter_opener_webのルート（開発環境でのメール確認用）
  if Rails.env.development? && defined?(LetterOpenerWeb)
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  namespace :api do
    post "/login", to: "sessions#create"
    post "/guest_login", to: "sessions#guest_login"
    post "/register", to: "users#create"
    resources :promises, only: [ :index, :create, :update, :destroy ] do
      resources :promise_evaluations, only: [ :create ]
    end
    get "/evaluated-promises", to: "evaluated_promises#index"
    get "/evaluation_pages/:id", to: "evaluation_pages#show"
    get "/get_me", to: "users#me"
    post "/evaluation_emails", to: "evaluation_emails#create"

    # 招待機能のルート
    resources :invitations, only: [ :create, :index ]
    get "/invite/:token", to: "invitations#accept"

    # パートナーシップ機能のルート
    delete "/partnerships/dissolve", to: "partnerships#dissolve"

    # スケジュールタスク用のルーティング
    post "/scheduled_tasks/send_due_date_evaluations", to: "scheduled_tasks#send_due_date_evaluations"
    post "/scheduled_tasks/send_weekly_our_promises_evaluation", to: "scheduled_tasks#send_weekly_our_promises_evaluation"
  end
end
