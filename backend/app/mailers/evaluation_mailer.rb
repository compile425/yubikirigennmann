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

  def self.send_weekly_evaluation_emails
    Partnership.includes(:user, :partner, :promises).find_each do |partnership|
      # 二人の約束の中で一番上（最新）のものを取得
      top_our_promise = partnership.promises.where(type: 'our_promise').order(:updated_at).first
      
      next unless top_our_promise

      # パートナーにメールを送信
      partner = partnership.partner
      user = partnership.user
      
      weekly_evaluation_email(user, partner, top_our_promise).deliver_now
    end
  end

  private

  def generate_evaluation_token(promise)
    # 簡単なトークン生成（実際の実装ではより安全な方法を使用）
    JWT.encode(
      { promise_id: promise.id, exp: 1.week.from_now.to_i },
      Rails.application.secret_key_base
    )
  end
end 