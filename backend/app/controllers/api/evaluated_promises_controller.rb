class Api::EvaluatedPromisesController < ApplicationController
  before_action :authenticate_user!

  def index
  return render json: [], status: :ok unless current_user&.partnership

  evaluated_promises = current_user.partnership.promises
    .evaluated
    .by_evaluation_month(params[:year], params[:month])
    .ordered_by_evaluation

  render json: evaluated_promises.map(&:to_evaluation_response)
  end
end
