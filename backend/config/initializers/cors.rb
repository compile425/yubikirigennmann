# backend/config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  if Rails.env.development?
    allow do
      origins /^http:\/\/localhost:\d+/, /^http:\/\/127\.0\.0\.1:\d+/
      resource "*", headers: :any,
               methods: [:get, :post, :put, :patch, :delete, :options, :head],
               credentials: true
    end
  else
    allow do
      origins "https://yubikirigenman.com", "https://www.yubikirigenman.com"
      resource "*", headers: :any,
               methods: [:get, :post, :put, :patch, :delete, :options, :head],
               credentials: true
    end
  end
end