class Partnership < ApplicationRecord
  has_many :users
  has_many :promises, dependent: :destroy
  has_many :one_words, dependent: :destroy
  has_many :promise_rating_scores, dependent: :destroy
  belongs_to :user, class_name: "User", foreign_key: "user_id"
  belongs_to :partner, class_name: "User", foreign_key: "partner_id"

  def partner_of(user)
  if user_id == user.id
    partner
  else
    self.user
  end
  end

  def create_default_promises
  default_promises = [
    "嫌な気分になったら一旦落ち着いてなぜそうなったのか観察する",
    "何かしてもらったら必ず感謝を伝える",
    "週に一度、2人の関係について話し合う時間を作る"
  ]

  default_promises.each do |content|
    promises.create!(
      content: content,
      type: "our_promise",
      creator: user, # 招待者が作成者となる
      due_date: nil # 期日なし
    )
  end
  end

  # パートナーシップを解消する
  def dissolve!
  ActiveRecord::Base.transaction do
    promises.destroy_all
    destroy!
  end
  end

  # 評価待ちの約束を取得
  def pending_evaluations_for(user)
  today = Date.today

  # 1. 相手が作成した約束で、期日が来ていて、まだ評価していないもの
  partner_promises = promises
    .left_joins(:promise_evaluation)
    .where(promise_evaluations: { id: nil })
    .where.not(creator_id: user.id)
    .where.not(type: "our_promise")
    .where("due_date <= ?", today)

  # 2. 今週評価すべきふたりの約束
  evaluator = Promise.weekly_evaluator(self)
  our_promise_to_evaluate = if evaluator == user
    promises.pending_our_promises.first
  end

  # 約束を結合してソート
  pending = partner_promises.to_a
  pending.unshift(our_promise_to_evaluate) if our_promise_to_evaluate

  # IDリストでクエリして、includesを適用
  Promise.where(id: pending.map(&:id))
    .includes(:creator)
    .order(:created_at)
  end

  # 月間りんご数を取得
  def monthly_apple_count
  current_month = Date.current.beginning_of_month
  promise_rating_scores
    .where(year_month: current_month)
    .sum(:harvested_apples)
  end

  # 週次評価メールを送信
  def send_weekly_evaluation_email!(sender)
  top_our_promise = promises.our_promises.order(:updated_at).first

  raise ArgumentError, "評価対象の約束が見つかりません" unless top_our_promise

  receiver = partner_of(sender)
  EvaluationMailer.weekly_evaluation_email(sender, receiver, top_our_promise).deliver_now

  {
    promise: top_our_promise,
    partner: receiver,
    sender: sender
  }
  end

  # 指定月の統計データを取得
  def monthly_stats(target_user, year_month = Date.current.beginning_of_month)
  partner_user = partner_of(target_user)

  {
    user: {
      name: target_user.name,
      average_score: target_user.monthly_average_score(year_month),
      evaluation_count: target_user.evaluated_promises.where(
    "created_at >= ? AND created_at < ?",
    year_month, year_month + 1.month
      ).count
    },
    partner: {
      name: partner_user.name,
      average_score: partner_user.monthly_average_score(year_month),
      evaluation_count: partner_user.evaluated_promises.where(
    "created_at >= ? AND created_at < ?",
    year_month, year_month + 1.month
      ).count
    },
    apple_count: promise_rating_scores.find_by(year_month: year_month)&.harvested_apples || 0,
    year_month: year_month
  }
  end
end
