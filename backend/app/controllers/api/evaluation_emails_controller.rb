class Api::EvaluationEmailsController < ApplicationController
  before_action :authenticate_user!

  def create
    Rails.logger.info "評価メール送信リクエスト - ユーザーID: #{current_user.id}"

    partnership = current_user.partnership
    unless partnership
      Rails.logger.error "パートナーシップが見つかりません - ユーザーID: #{current_user.id}"
      render json: {
        error: "パートナーシップが存在しません",
        user_id: current_user.id,
        user_email: current_user.email
      }, status: :unprocessable_entity
      return
    end

    Rails.logger.info "パートナーシップ発見 - ID: #{partnership.id}, ユーザーID: #{partnership.user_id}, パートナーID: #{partnership.partner_id}"

    top_our_promise = partnership.promises.where(type: "our_promise").order(:updated_at).first

    unless top_our_promise
      Rails.logger.error "our_promiseが見つかりません - パートナーシップID: #{partnership.id}"
      render json: {
        error: "評価対象の約束が見つかりません",
        partnership_id: partnership.id,
        available_promises: partnership.promises.pluck(:id, :type)
      }, status: :not_found
      return
    end

    Rails.logger.info "評価対象の約束発見 - 約束ID: #{top_our_promise.id}"

    partner = partnership.user == current_user ? partnership.partner : partnership.user

    begin
      EvaluationMailer.weekly_evaluation_email(current_user, partner, top_our_promise).deliver_now

      Rails.logger.info "評価メール送信成功 - 送信者: #{current_user.email}, 受信者: #{partner.email}"

      render json: {
        message: "評価メールを送信しました",
        promise: top_our_promise,
        partner: partner,
        sender: current_user
      }
    rescue => e
      Rails.logger.error "メール送信エラー: #{e.message}"
      render json: {
        error: "メール送信に失敗しました",
        details: e.message
      }, status: :internal_server_error
    end
  end
end
