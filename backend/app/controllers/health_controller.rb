class HealthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:show]

  def show
    render json: { status: 'ok', timestamp: Time.current }
  end
end