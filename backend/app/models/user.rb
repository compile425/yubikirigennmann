class User < ApplicationRecord
  has_one :user_credential, dependent: :destroy
  has_many :partnerships_as_user, class_name: "Partnership", foreign_key: "user_id", dependent: :destroy
  has_many :partnerships_as_partner, class_name: "Partnership", foreign_key: "partner_id", dependent: :destroy
  has_many :created_promises, class_name: "Promise", foreign_key: "creator_id", dependent: :destroy
  has_many :evaluated_promises, class_name: "PromiseEvaluation", foreign_key: "evaluator_id", dependent: :destroy
  has_many :sent_one_words, class_name: "OneWord", foreign_key: "sender_id", dependent: :destroy
  has_many :invitation_codes, foreign_key: "inviter_id", dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  def partnership
    partnerships_as_user.first || partnerships_as_partner.first
  end

  # パスワードリセットトークンを生成
  def generate_password_reset_token
    self.reset_password_token = SecureRandom.urlsafe_base64
    self.reset_password_sent_at = Time.current
    save(validate: false)
  end

  # パスワードリセットトークンの有効期限チェック（2時間）
  def password_reset_token_valid?
    reset_password_sent_at.present? && reset_password_sent_at > 2.hours.ago
  end

  # パスワードリセットトークンをクリア
  def clear_password_reset_token
    self.reset_password_token = nil
    self.reset_password_sent_at = nil
    save(validate: false)
  end

  # パスワードをリセットする
  def reset_password!(new_password)
    raise ArgumentError, "無効なトークンです" unless reset_password_token.present?
    raise ArgumentError, "トークンの有効期限が切れています" unless password_reset_token_valid?

    ActiveRecord::Base.transaction do
      user_credential.update!(password: new_password, password_confirmation: new_password)
      clear_password_reset_token
    end
  end

  # パスワードリセットメールを送信
  def send_password_reset_email!
    generate_password_reset_token
    PasswordResetMailer.reset_email(self).deliver_now
  end

  # 平均スコアを計算（このユーザーが作成した約束に対する評価の平均）
  def average_score
    # このユーザーが作成した約束に対する評価を取得
    evaluations = PromiseEvaluation
      .joins(:promise)
      .where(promises: { creator_id: id })

    return 0.0 if evaluations.empty?

    total_score = evaluations.sum(:rating)
    count = evaluations.count
    count > 0 ? total_score.to_f / count : 0.0
  end

  # スコアトレンドを計算（先月比）
  def score_trend
    current_month = Date.current.beginning_of_month
    last_month = current_month - 1.month

    current_score = monthly_average_score(current_month)
    last_score = monthly_average_score(last_month)

    current_score - last_score
  end

  # 月間平均スコアを計算（このユーザーが作成した約束に対する評価の平均）
  def monthly_average_score(month_start)
    # month_start を Time オブジェクトに変換してタイムゾーンを考慮
    start_time = month_start.beginning_of_day.in_time_zone
    end_time = (month_start + 1.month).beginning_of_day.in_time_zone

    # このユーザーが作成した約束に対する評価を取得
    evaluations = PromiseEvaluation
      .joins(:promise)
      .where(promises: { creator_id: id })
      .where("promise_evaluations.created_at >= ? AND promise_evaluations.created_at < ?", start_time, end_time)

    return 0.0 if evaluations.empty?

    total_score = evaluations.sum(:rating)
    count = evaluations.count
    count > 0 ? total_score.to_f / count : 0.0
  end

  # ユーザーと認証情報を一緒に作成
  def self.create_with_credential!(user_params, credential_params)
    ActiveRecord::Base.transaction do
      user = create!(user_params)
      user.create_user_credential!(credential_params)
      user
    end
  end
end
