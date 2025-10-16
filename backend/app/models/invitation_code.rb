class InvitationCode < ApplicationRecord
  belongs_to :inviter, class_name: "User"

  validates :code, presence: true, uniqueness: true, length: { is: 8 }, format: { with: /\A[a-zA-Z0-9]+\z/ }
  validates :inviter_id, uniqueness: { scope: :used, conditions: -> { where(used: false) }, message: "は既に未利用の招待コードを所有しています。" }

  before_validation :generate_code, on: :create

  scope :active, -> { where(used: false) }
  scope :used, -> { where(used: true) }

  def mark_as_used!
    update!(used: true)
  end

  # 招待コードを使ってパートナーシップを結ぶ
  def join_partnership!(partner_user)
    raise ArgumentError, "自分の招待コードは使用できません" if inviter_id == partner_user.id
    raise ArgumentError, "既にパートナーシップが存在します" if partner_user.partnership
    raise ArgumentError, "この招待コードは既に使用されています" if used?

    ActiveRecord::Base.transaction do
      partnership = Partnership.create!(
        user: inviter,
        partner: partner_user
      )

      # デフォルトの約束を作成
      partnership.create_default_promises

      # 招待コードを使用済みにする
      mark_as_used!

      partnership
    end
  end

  private

  def generate_code
    return if code.present?

    loop do
      self.code = generate_random_code
      break unless InvitationCode.exists?(code: code)
    end
  end

  def generate_random_code
    # 英数字8文字のランダムコードを生成
    charset = Array("A".."Z") + Array("0".."9")
    Array.new(8) { charset.sample }.join
  end
end
