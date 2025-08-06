class Api::UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: [:me], raise: false
  
  def me
    @current_user = current_user
    
    if @current_user&.partnership
      if @current_user.partnership.user_id == @current_user.id
        @partner = @current_user.partnership.partner
      else
        @partner = @current_user.partnership.user
      end
    end

    render json: {
      current_user: @current_user,
      partner: @partner
    }
  end
end