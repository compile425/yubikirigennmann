class Api::PendingEvaluationsController < ApplicationController
  before_action :authenticate_user!

  def index
    if current_user&.partnership
      # 評価待ちの約束を取得（評価が存在しない約束のみ）
      # 現在のユーザーが作成した約束で、パートナーが評価していないもの
      # または、パートナーが作成した約束で、現在のユーザーが評価していないもの
      @pending_promises = current_user.partnership.promises
        .left_joins(:promise_evaluation)
        .where(promise_evaluations: { id: nil })
        .includes(:creator)
        .order(:created_at)

      response_data = @pending_promises.map do |promise|
        {
          id: promise.id,
          content: promise.content,
          due_date: promise.due_date,
          type: promise.type,
          creator_id: promise.creator_id,
          creator_name: promise.creator.name,
          created_at: promise.created_at
        }
      end

      Rails.logger.info "PendingEvaluations API Response: #{response_data}"
      render json: response_data
    else
      render json: [], status: :ok
    end
  end
end
