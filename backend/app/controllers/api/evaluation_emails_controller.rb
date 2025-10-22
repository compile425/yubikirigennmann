class Api::EvaluationEmailsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_partnership

  def create
  result = @partnership.send_weekly_evaluation_email!(current_user)

  render json: {
    message: "評価メールを送信しました",
    promise: result[:promise],
    partner: result[:partner],
    sender: result[:sender]
  }
  rescue ArgumentError => e
  Rails.logger.error "評価対象の約束が見つかりません - パートナーシップID: #{@partnership.id}"
  render json: { error: e.message }, status: :not_found
  rescue => e
  Rails.logger.error "メール送信エラー: #{e.message}"
  render json: {
    error: "メール送信に失敗しました",
    details: e.message
  }, status: :internal_server_error
  end

  private

  def set_partnership
  @partnership = current_user.partnership

  unless @partnership
    Rails.logger.error "パートナーシップが見つかりません - ユーザーID: #{current_user.id}"
    render json: {
      error: "パートナーシップが存在しません",
      user_id: current_user.id,
      user_email: current_user.email
    }, status: :unprocessable_entity
  end
  end
end
