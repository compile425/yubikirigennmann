class Api::EvaluationEmailsController < ApplicationController
  before_action :authenticate_user!

  def create
    partnership = current_user.partnership
    unless partnership
      render json: { error: 'パートナーシップが存在しません' }, status: :unprocessable_entity
      return
    end

    top_our_promise = partnership.promises.where(type: 'our_promise').order(:updated_at).first

    unless top_our_promise
      render json: { error: '評価対象の約束が見つかりません' }, status: :not_found
      return
    end

    partner = partnership.user == current_user ? partnership.partner : partnership.user
    
    begin
      EvaluationMailer.weekly_evaluation_email(current_user, partner, top_our_promise).deliver_now
      
      render json: { 
        message: '評価メールを送信しました',
        promise: top_our_promise,
        partner: partner
      }
    rescue => e
      Rails.logger.error "メール送信エラー: #{e.message}"
      render json: { error: 'メール送信に失敗しました' }, status: :internal_server_error
    end
  end
end 