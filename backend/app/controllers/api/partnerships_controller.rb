class Api::PartnershipsController < ApplicationController
  before_action :authenticate_user!

  def dissolve
    partnership = current_user.partnership
    
    unless partnership
      render json: { error: 'パートナーシップが存在しません' }, status: :not_found
      return
    end

    begin
      partnership.promises.destroy_all
      partnership.destroy
      
      Rails.logger.info "パートナーシップを解消しました - ユーザーID: #{current_user.id}"
      
      render json: { 
        message: 'パートナーシップを解消しました',
        user_id: current_user.id
      }
    rescue => e
      Rails.logger.error "パートナーシップ解消エラー: #{e.message}"
      render json: { 
        error: 'パートナーシップの解消に失敗しました',
        details: e.message
      }, status: :internal_server_error
    end
  end
end 