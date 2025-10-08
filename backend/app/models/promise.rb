class Promise < ApplicationRecord
    self.inheritance_column = :_type_disabled
    belongs_to :partnership
    belongs_to :creator, class_name: "User"
    has_many :promise_histories, dependent: :destroy
    has_one :promise_evaluation, dependent: :destroy

    belongs_to :parent_promise, class_name: "Promise", optional: true, foreign_key: "promise_id"
    has_many :child_promises, class_name: "Promise", foreign_key: "promise_id"

    validates :content, presence: true
    validates :type, presence: true

    # スコープ：ふたりの約束
    scope :our_promises, -> {
      where(type: "our_promise")
    }

    # スコープ：評価待ちのふたりの約束（評価がないもの）を更新日順で取得
    scope :pending_our_promises, -> {
      our_promises
        .left_joins(:promise_evaluation)
        .where(promise_evaluations: { id: nil })
        .order(:updated_at)
    }

    # スコープ：評価済みの約束のみ
    scope :evaluated, -> {
      joins(:promise_evaluation)
        .includes(:promise_evaluation, :creator)
    }

    # スコープ：指定された年月で評価された約束
    scope :by_evaluation_month, ->(year, month) {
      return all if year.blank? || month.blank?

      start_date = Date.new(year.to_i, month.to_i, 1).beginning_of_day
      end_date = start_date.end_of_month.end_of_day

      where("promise_evaluations.created_at >= ? AND promise_evaluations.created_at <= ?",
            start_date, end_date)
    }

    # スコープ：評価日の降順でソート
    scope :ordered_by_evaluation, -> {
      order("promise_evaluations.created_at DESC")
    }

    # 今週の評価者を判定（週番号の偶数/奇数で切り替え）
    def self.weekly_evaluator(partnership)
      week_number = Date.current.cweek
      week_number.even? ? partnership.partner : partnership.user
    end

    # 今週の評価対象ユーザーを判定（評価者の相手）
    def self.weekly_evaluatee(partnership)
      week_number = Date.current.cweek
      week_number.even? ? partnership.user : partnership.partner
    end

    # 評価を完了してループに戻す（評価レコードを削除してupdated_atを更新）
    def reset_for_next_evaluation
      return false unless promise_evaluation

      promise_evaluation.destroy
      touch  # updated_atを現在時刻に更新（一番下に移動）
      true
    end

    # レスポンス用のハッシュに変換
    def to_evaluation_response
      {
        id: id,
        content: content,
        due_date: due_date,
        type: type,
        creator_id: creator_id,
        rating: promise_evaluation.rating,
        evaluation_text: promise_evaluation.evaluation_text,
        evaluation_date: promise_evaluation.created_at,
        evaluator_name: promise_evaluation.evaluator.name
      }
    end

    after_validation :log_validation_errors

    private

    def log_validation_errors
      if errors.any?
        Rails.logger.error "Promise validation errors: #{errors.full_messages}"
      end
    end
end
