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

    after_validation :log_validation_errors

    private

    def log_validation_errors
      if errors.any?
        Rails.logger.error "Promise validation errors: #{errors.full_messages}"
      end
    end
end
