class ApplicationController < ActionController::API
  before_action :authenticate_user!

  private

  def auth_header
    request.headers['Authorization']
  end

  def decoded_token
    if auth_header
      token = auth_header.split(' ')[1]
      begin
        decode_token(token)
      rescue JWT::DecodeError
        nil
      end
    end
  end

  def current_user
    if decoded_token
      user_id = decoded_token['user_id']
      @current_user ||= User.find_by(id: user_id)
    end
  end

  def authenticate_user!
    render json: { error: 'Not Authorized' }, status: :unauthorized unless !!current_user
  end

  def encode_token(payload)
    payload[:exp] = 24.hours.from_now.to_i
    secret_key = Rails.application.credentials.secret_key_base || Rails.application.secret_key_base
    JWT.encode(payload, secret_key)
  end

  def decode_token(token)
    secret_key = Rails.application.credentials.secret_key_base || Rails.application.secret_key_base
    begin
      decoded = JWT.decode(token, secret_key, true, algorithm: 'HS256')
      HashWithIndifferentAccess.new decoded[0]
    rescue JWT::DecodeError
      nil
    end
  end
end