class Api::EvaluationPagesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:show]

  def show
    token = params[:token]
    
    begin
      decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: 'HS256' })
      promise_id = decoded_token[0]['promise_id']
      @promise = Promise.find(promise_id)
      
      render json: {
        promise: @promise,
        valid_token: true
      }
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { 
        error: '無効なトークンです',
        valid_token: false
      }, status: :unauthorized
    end
  end
end 