class Api::ScheduledTasksController < ApplicationController
  before_action :authenticate_user!

  def send_due_date_evaluations
    begin
      EvaluationMailer.send_due_date_evaluations
      render json: { message: "期日が来た約束の評価メールを送信しました" }, status: :ok
    rescue => e
      render json: { error: "メール送信に失敗しました: #{e.message}" }, status: :internal_server_error
    end
  end

  def send_weekly_our_promises_evaluation
    begin
      EvaluationMailer.send_weekly_our_promises_evaluation
      render json: { message: "毎週の二人の約束評価メールを送信しました" }, status: :ok
    rescue => e
      render json: { error: "メール送信に失敗しました: #{e.message}" }, status: :internal_server_error
    end
  end
end 