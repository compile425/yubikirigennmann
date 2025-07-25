class Api::UsersController < ApplicationController
    protect_from_forgery with: :null_session
  
    def create
      user_attributes = user_params
      user = User.new(user_attributes)
      user.build_partnership

      if user.save
        render json: user, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    private
  
    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
  end