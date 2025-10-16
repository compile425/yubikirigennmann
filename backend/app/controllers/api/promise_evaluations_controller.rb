class Api::PromiseEvaluationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_promise, only: [ :create ]

  def create
    evaluation = @promise.evaluate!(
      evaluator: current_user,
      rating: evaluation_params[:rating],
      evaluation_text: evaluation_params[:evaluation_text]
    )

    render json: evaluation, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def set_promise
    @promise = Promise.find(params[:promise_id])
  end

  def evaluation_params
    params.require(:evaluation).permit(:rating, :evaluation_text)
  end
end
