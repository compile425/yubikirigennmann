class Api::PendingEvaluationsController < ApplicationController
  before_action :authenticate_user!

  def index
    return render json: [] unless current_user&.partnership

    pending_promises = current_user.partnership.pending_evaluations_for(current_user)

    render json: pending_promises.map { |promise|
      {
        id: promise.id,
        content: promise.content,
        due_date: promise.due_date,
        type: promise.type,
        creator_id: promise.creator_id,
        creator_name: promise.creator.name,
        created_at: promise.created_at
      }
    }
  end
end
