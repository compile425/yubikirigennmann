class Api::PromisesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_promise, only: [ :update, :destroy ]

  def index
    if current_user&.partnership
      @promises = current_user.partnership.promises
      render json: @promises
    else
      render json: [], status: :ok
    end
  end

  def create
    partnership = current_user.partnership
    unless partnership
      render json: { error: "パートナーシップが存在しません" }, status: :unprocessable_entity
      return
    end

    promise = partnership.promises.new(promise_params)
    promise.creator = current_user
    Rails.logger.info "Creating promise with params: #{promise_params}"
    Rails.logger.info "Partnership ID: #{partnership.id}"
    Rails.logger.info "Creator ID: #{current_user.id}"

    if promise.save
      render json: promise, status: :created
    else
      Rails.logger.error "Promise validation errors: #{promise.errors.full_messages}"
      render json: { errors: promise.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @promise.update(promise_params)
      render json: @promise
    else
      render json: { errors: @promise.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @promise.destroy
    head :no_content
  end

  private

  def set_promise
    @promise = Promise.find(params[:id])
  end

  def promise_params
    permitted_params = params.require(:promise).permit(:content, :due_date, :type, :promise_id)
    
    # ふたりの約束の場合は期日をnilに設定
    if permitted_params[:type] == 'our_promise'
      permitted_params[:due_date] = nil
    end
    
    permitted_params
  end
end
