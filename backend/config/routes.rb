Rails.application.routes.draw do
  namespace :api do
    post '/login', to: 'sessions#create'
    resources :promises, only: [:index, :create, :update, :destroy] do
      resources :promise_evaluations, only: [:create]
    end
    get '/evaluated-promises', to: 'evaluated_promises#index'
    get '/evaluation_pages/:id', to: 'evaluation_pages#show'
    get '/get_me', to: 'users#me'
  end
end