class Api::PendingEvaluationsController < ApplicationController
  before_action :authenticate_user!

  def index
    if current_user&.partnership
      partnership = current_user.partnership

      # 1. 相手が作成した約束で、期日が来ていて、自分がまだ評価していないもの
      today = Date.today
      partner_promises = partnership.promises
        .left_joins(:promise_evaluation)
        .where(promise_evaluations: { id: nil })
        .where.not(creator_id: current_user.id)
        .where.not(type: "our_promise")  # ふたりの約束は別処理
        .where("due_date <= ?", today)  # 期日が来ているもののみ

      # 2. 今週評価すべきふたりの約束（週番号で評価者を判定）
      evaluator = Promise.weekly_evaluator(partnership)
      our_promise_to_evaluate = if evaluator == current_user
        # 自分が今週の評価者なら、一番古い評価待ちのふたりの約束を取得
        partnership.promises.pending_our_promises.first
      end

      # 約束を結合
      @pending_promises = partner_promises.to_a
      @pending_promises.unshift(our_promise_to_evaluate) if our_promise_to_evaluate
      @pending_promises = @pending_promises.sort_by(&:created_at)

      # includes を後から適用
      @pending_promises = Promise.where(id: @pending_promises.map(&:id))
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

      render json: response_data
    else
      render json: [], status: :ok
    end
  end
end
