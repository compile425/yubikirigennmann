Rails.application.routes.draw do
  namespace :api do
    post '/login', to: 'sessions#create'
    resources :promises, only: [:index, :create, :update, :destroy] do
      resources :promise_evaluations, only: [:create]
    end
    get '/evaluated-promises', to: 'evaluated_promises#index'
    get '/evaluation_pages/:id', to: 'evaluation_pages#show'
    get '/get_me', to: 'users#me'
    post '/evaluation_emails', to: 'evaluation_emails#create'
    
    # スケジュールタスク用のルーティング
    post '/scheduled_tasks/send_due_date_evaluations', to: 'scheduled_tasks#send_due_date_evaluations'
    post '/scheduled_tasks/send_weekly_our_promises_evaluation', to: 'scheduled_tasks#send_weekly_our_promises_evaluation'
  end
end