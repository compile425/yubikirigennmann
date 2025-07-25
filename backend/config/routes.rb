Rails.application.routes.draw do
    post "/api/users", to: "api/users#create"
end