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
end
