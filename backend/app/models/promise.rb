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
    validate :due_date_cannot_be_in_the_past

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

    # 評価を作成または更新する
    def evaluate!(evaluator:, rating:, evaluation_text:)
      evaluation = promise_evaluation || build_promise_evaluation
      rating_value = rating.to_i
      evaluation.assign_attributes(
        evaluator: evaluator,
        rating: rating_value,
        evaluation_text: evaluation_text
      )

      ActiveRecord::Base.transaction do
        evaluation.save!
        touch # updated_atを更新

        # 評価が4以上の場合、アップルカウントを増やす
        increment_apple_count if rating_value >= 4
      end

      evaluation
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

    # 評価済みのふたりの約束を全てリセット
    def self.reset_evaluated_our_promises
      reset_count = 0
      Partnership.includes(:promises).find_each do |partnership|
        partnership.promises.our_promises.each do |promise|
          reset_count += 1 if promise.reset_for_next_evaluation
        end
      end
      reset_count
    end

    after_validation :log_validation_errors

    private

    def due_date_cannot_be_in_the_past
      return if due_date.blank? # 期日がない場合（our_promise）はスキップ

      if due_date.present? && due_date < Date.today
        errors.add(:due_date, "は過去の日付を設定できません")
      end
    end

    def log_validation_errors
      if errors.any?
        Rails.logger.error "Promise validation errors: #{errors.full_messages}"
      end
    end

    def increment_apple_count
      return unless partnership

      current_month = Date.current.beginning_of_month

      # 当月のスコアレコードを取得または作成
      rating_score = partnership.promise_rating_scores.find_or_initialize_by(
        year_month: current_month
      )

      # アップルカウントを1増やす
      rating_score.harvested_apples ||= 0
      rating_score.harvested_apples += 1
      rating_score.save!
    end
end
