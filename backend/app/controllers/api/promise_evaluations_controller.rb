class Api::PromiseEvaluationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_promise, only: [:create]

  def create
    evaluation = @promise.promise_evaluation || @promise.build_promise_evaluation
    evaluation.evaluation_text = params[:evaluation][:evaluation_text]
    evaluation.rating = params[:evaluation][:rating]
    evaluation.evaluator = current_user

    if evaluation.save
      # 評価された約束を一番下に移動
      @promise.update(updated_at: Time.current)
      render json: evaluation, status: :created
    else
      render json: { errors: evaluation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_promise
    @promise = Promise.find(params[:promise_id])
  end
end 