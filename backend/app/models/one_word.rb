class OneWord < ApplicationRecord
  belongs_to :partnership
  belongs_to :sender, class_name: "User"
  belongs_to :receiver, class_name: "User"

  validates :content, presence: true

  # 指定された年月でフィルタリング
  scope :by_year_month, ->(year, month) {
    return all if year.blank? || month.blank?

    start_date = Date.new(year.to_i, month.to_i, 1).beginning_of_day
    end_date = start_date.end_of_month.end_of_day
    where(created_at: start_date..end_date)
  }

  # 受信者向けのスコープ
  scope :for_receiver, ->(receiver) {
    where(receiver_id: receiver.id)
  }

  # レスポンス用のハッシュに変換
  def to_response_hash
    {
      id: id,
      content: content,
      created_at: created_at,
      sender_name: sender.name
    }
  end
end
