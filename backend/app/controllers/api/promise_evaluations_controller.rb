class Api::PromiseEvaluationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_promise, only: [ :create ]

  def create
    evaluation = @promise.promise_evaluation || @promise.build_promise_evaluation
    evaluation.evaluation_text = params[:evaluation][:evaluation_text]
    evaluation.rating = params[:evaluation][:rating]
    evaluation.evaluator = current_user

    if evaluation.save
      @promise.update(updated_at: Time.current)

      # 評価が4以上の場合、アップルカウントを増やす
      if evaluation.rating >= 4
        increment_apple_count
      end

      render json: evaluation, status: :created
    else
      render json: { errors: evaluation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_promise
    @promise = Promise.find(params[:promise_id])
  end

  def increment_apple_count
    return unless current_user&.partnership

    partnership = current_user.partnership
    current_month = Date.current.beginning_of_month

    # 当月のスコアレコードを取得または作成
    rating_score = partnership.promise_rating_scores.find_or_initialize_by(
      year_month: current_month
    )

    # アップルカウントを1増やす
    rating_score.harvested_apples ||= 0
    rating_score.harvested_apples += 1
    rating_score.save
  end
end
