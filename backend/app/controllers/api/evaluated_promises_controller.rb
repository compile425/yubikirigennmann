class Api::EvaluatedPromisesController < ApplicationController
  before_action :authenticate_user!

  def index
    if current_user&.partnership
      @evaluated_promises = current_user.partnership.promises
        .joins(:promise_evaluation)
        .includes(:promise_evaluation, :creator)
        .order('promise_evaluations.created_at DESC')

      response_data = @evaluated_promises.map do |promise|
        {
          id: promise.id,
          content: promise.content,
          due_date: promise.due_date,
          type: promise.type,
          creator_id: promise.creator_id,
          rating: promise.promise_evaluation.rating,
          evaluation_date: promise.promise_evaluation.created_at,
          evaluator_name: promise.promise_evaluation.evaluator.name
        }
      end

      Rails.logger.info "EvaluatedPromises API Response: #{response_data}"
      render json: response_data
    else
      render json: [], status: :ok
    end
  end
end 