class Api::PartnershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_partnership, only: [ :dissolve, :create_default_promises ]

  def dissolve
  @partnership.dissolve!
  render json: {
    message: "パートナーシップを解消しました",
    user_id: current_user.id
  }
  rescue ActiveRecord::RecordNotDestroyed => e
  Rails.logger.error "パートナーシップ解消エラー: #{e.message}"
  render json: {
    error: "パートナーシップの解消に失敗しました",
    details: e.message
  }, status: :internal_server_error
  end

  def create_default_promises
  @partnership.create_default_promises
  render json: { message: "デフォルトの約束を作成しました" }
  rescue ActiveRecord::RecordInvalid => e
  Rails.logger.error "デフォルトの約束作成エラー: #{e.message}"
  render json: {
    error: "デフォルトの約束の作成に失敗しました",
    details: e.record.errors.full_messages
  }, status: :unprocessable_entity
  end

  private

  def set_partnership
  @partnership = current_user.partnership
  render json: { error: "パートナーシップが存在しません" }, status: :not_found unless @partnership
  end
end
