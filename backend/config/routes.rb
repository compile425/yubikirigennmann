Rails.application.routes.draw do
  # letter_opener_webのルート（開発環境でのメール確認用）
  if Rails.env.development? && defined?(LetterOpenerWeb)
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  # ALB用のヘルスチェックのためAPIルート
  get "/health", to: "health#show"

  namespace :api do
    post "/login", to: "sessions#create"
    post "/guest_login", to: "sessions#guest_login"
    post "/register", to: "users#create"

    # パスワードリセット
    post "/password-resets", to: "password_resets#create"
    put "/password-resets", to: "password_resets#update"
    resources :promises, only: [ :index, :create, :update, :destroy ] do
      resources :promise_evaluations, only: [ :create ]
    end
    get "/evaluated-promises", to: "evaluated_promises#index"
    get "/pending-evaluations", to: "pending_evaluations#index"
    get "/evaluation_pages/:id", to: "evaluation_pages#show"
    get "/get_me", to: "users#me"
    get "/user_stats", to: "users#stats"
    post "/evaluation_emails", to: "evaluation_emails#create"

    # 招待コード機能のルート
    post "/invitation-codes", to: "invitation_codes#create"
    post "/join-partnership", to: "invitation_codes#join_partnership"

    # パートナーシップ機能のルート
    delete "/partnerships/dissolve", to: "partnerships#dissolve"
    post "/partnerships/create_default_promises", to: "partnerships#create_default_promises"

    # ちょっと一言のルート
    resources :one_words, only: [ :index, :create ]

    # スケジュールタスク用のルーティング
    post "/scheduled_tasks/send_due_date_evaluations", to: "scheduled_tasks#send_due_date_evaluations"
    post "/scheduled_tasks/send_weekly_our_promises_evaluation", to: "scheduled_tasks#send_weekly_our_promises_evaluation"
    post "/scheduled_tasks/reset_our_promises_for_weekly_evaluation", to: "scheduled_tasks#reset_our_promises_for_weekly_evaluation"
  end
end
