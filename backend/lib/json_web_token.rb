require 'jwt'

class JsonWebToken
  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    secret_key = Rails.application.credentials.secret_key_base || Rails.application.secret_key_base
    JWT.encode(payload, secret_key)
  end

  def self.decode(token)
    secret_key = Rails.application.credentials.secret_key_base || Rails.application.secret_key_base
    decoded = JWT.decode(token, secret_key)[0]
    HashWithIndifferentAccess.new decoded
  end
end