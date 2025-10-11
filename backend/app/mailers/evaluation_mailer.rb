class EvaluationMailer < ApplicationMailer
  def weekly_evaluation_email(user, partner, promise)
    @user = user
    @partner = partner
    @promise = promise
    @pending_evaluations_url = "#{ENV['FRONTEND_URL'] || 'http://localhost:5173'}/pending-evaluations"

    mail(
      to: partner.email,
      subject: "【ゆびきりげんまん】評価待ちの約束があります"
    )
  end

  def due_date_evaluation_email(promise, evaluator)
    @promise = promise
    @evaluator = evaluator
    @pending_evaluations_url = "#{ENV['FRONTEND_URL'] || 'http://localhost:5173'}/pending-evaluations"

    mail(
      to: evaluator.email,
      subject: "【ゆびきりげんまん】評価待ちの約束があります"
    )
  end

  def self.send_due_date_evaluations
    today = Date.current
    # 期日が来た約束のみ（our_promiseは除外される）
    due_promises = Promise.where(due_date: today)
      .where.not(type: "our_promise")
      .includes(:creator, :partnership)

    due_promises.each do |promise|
      partnership = promise.partnership
      next unless partnership

      # 約束の作成者の相手に送信
      if promise.creator_id == partnership.user_id
        evaluator = partnership.partner
      else
        evaluator = partnership.user
      end

      begin
        due_date_evaluation_email(promise, evaluator).deliver_now
      rescue => e
        Rails.logger.error "Failed to send due date evaluation email to #{evaluator.email}: #{e.message}"
        # 個別のメール送信に失敗しても他のメールは送信を続行
      end
    end
  end

  def self.send_weekly_our_promises_evaluation
    Partnership.includes(:user, :partner, :promises).find_each do |partnership|
      top_our_promise = partnership.promises.where(type: "our_promise").order(:updated_at).first

      next unless top_our_promise

      week_number = Date.current.cweek
      if week_number.even?
        evaluator = partnership.partner
        user = partnership.user
      else
        evaluator = partnership.user
        user = partnership.partner
      end

      begin
        weekly_evaluation_email(user, evaluator, top_our_promise).deliver_now
      rescue => e
        Rails.logger.error "Failed to send weekly evaluation email to #{evaluator.email}: #{e.message}"
        # 個別のメール送信に失敗しても他のメールは送信を続行
      end
    end
  end

  def self.send_weekly_evaluation_emails
    Partnership.includes(:user, :partner, :promises).find_each do |partnership|
      top_our_promise = partnership.promises.where(type: "our_promise").order(:updated_at).first

      next unless top_our_promise

      partner = partnership.partner
      user = partnership.user

      begin
        weekly_evaluation_email(user, partner, top_our_promise).deliver_now
      rescue => e
        Rails.logger.error "Failed to send weekly evaluation email to #{partner.email}: #{e.message}"
        # 個別のメール送信に失敗しても他のメールは送信を続行
      end
    end
  end
end
