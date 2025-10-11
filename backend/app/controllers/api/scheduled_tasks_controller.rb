class Api::ScheduledTasksController < ApplicationController
  before_action :authenticate_user!

  def send_due_date_evaluations
    begin
      EvaluationMailer.send_due_date_evaluations
      render json: { message: "期日が来た約束の評価メールを送信しました" }, status: :ok
    rescue => e
      Rails.logger.error "Failed to send due date evaluation emails: #{e.message}"
      render json: { error: "メール送信に失敗しました: #{e.message}" }, status: :internal_server_error
    end
  end

  def send_weekly_our_promises_evaluation
    begin
      EvaluationMailer.send_weekly_our_promises_evaluation
      render json: { message: "毎週の二人の約束評価メールを送信しました" }, status: :ok
    rescue => e
      Rails.logger.error "Failed to send weekly evaluation emails: #{e.message}"
      render json: { error: "メール送信に失敗しました: #{e.message}" }, status: :internal_server_error
    end
  end

  def reset_our_promises_for_weekly_evaluation
    begin
      reset_count = 0
      Partnership.includes(:promises).find_each do |partnership|
        # 評価済みのふたりの約束を全てリセット
        partnership.promises.our_promises.each do |promise|
          if promise.reset_for_next_evaluation
            reset_count += 1
          end
        end
      end

      render json: { message: "#{reset_count}件のふたりの約束をリセットしました", count: reset_count }, status: :ok
    rescue => e
      Rails.logger.error "Failed to reset our_promises: #{e.message}"
      render json: { error: "リセットに失敗しました: #{e.message}" }, status: :internal_server_error
    end
  end
end
