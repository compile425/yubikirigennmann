class EvaluationMailer < ApplicationMailer
  def weekly_evaluation_email(user, partner, promise)
    @user = user
    @partner = partner
    @promise = promise
    @evaluation_url = "http://localhost:3000/evaluate/#{promise.id}?token=#{generate_evaluation_token(promise)}"
    
    mail(
      to: partner.email,
      subject: "【約束の評価】今週の約束を評価してください"
    )
  end

  def due_date_evaluation_email(promise, evaluator)
    @promise = promise
    @evaluator = evaluator
    @evaluation_url = "http://localhost:3000/evaluate/#{promise.id}?token=#{generate_evaluation_token(promise)}"
    
    mail(
      to: evaluator.email,
      subject: "【約束の評価】期日が来た約束を評価してください"
    )
  end

  def self.send_due_date_evaluations
    today = Date.current
    due_promises = Promise.where(due_date: today).includes(:creator, :partnership)
    
    due_promises.each do |promise|
      partnership = promise.partnership
      
      if promise.creator_id == partnership.user_id
        evaluator = partnership.partner
      else
        evaluator = partnership.user
      end
      
      due_date_evaluation_email(promise, evaluator).deliver_now
    end
  end

  def self.send_weekly_our_promises_evaluation
    Partnership.includes(:user, :partner, :promises).find_each do |partnership|
      top_our_promise = partnership.promises.where(type: 'our_promise').order(:updated_at).first
      
      next unless top_our_promise

      week_number = Date.current.cweek
      if week_number.even?
        evaluator = partnership.partner
        user = partnership.user
      else
        evaluator = partnership.user
        user = partnership.partner
      end
      
      weekly_evaluation_email(user, evaluator, top_our_promise).deliver_now
    end
  end

  def self.send_weekly_evaluation_emails
    Partnership.includes(:user, :partner, :promises).find_each do |partnership|
      top_our_promise = partnership.promises.where(type: 'our_promise').order(:updated_at).first
      
      next unless top_our_promise

      partner = partnership.partner
      user = partnership.user
      
      weekly_evaluation_email(user, partner, top_our_promise).deliver_now
    end
  end

  private

  def generate_evaluation_token(promise)
    JWT.encode(
      { promise_id: promise.id, exp: 1.week.from_now.to_i },
      Rails.application.secret_key_base
    )
  end
end 