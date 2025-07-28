class Api::SessionsController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false
  
    def create
      user = User.find_by(email: params[:email])
  
      if user&.authenticate(params[:password])
        token = ::JsonWebToken.encode(user_id: user.id)
        render json: { token: token }, status: :ok
      else
        render json: { error: 'Invalid email or password' }, status: :unauthorized
      end
    end
  end