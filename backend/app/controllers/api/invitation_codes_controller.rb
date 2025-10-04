class Api::InvitationCodesController < ApplicationController
  before_action :authenticate_user!

  def create
    if current_user.partnership
      render json: { error: "既にパートナーシップが存在します" }, status: :unprocessable_entity
      return
    end

    # 既存のアクティブな招待コードがあれば削除
    current_user.invitation_codes.active.destroy_all

    invitation_code = current_user.invitation_codes.build

    if invitation_code.save
      render json: {
        invitation_code: invitation_code.code
      }, status: :created
    else
      render json: {
        error: invitation_code.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  def join_partnership
    code = params[:invitation_code]

    unless code.present?
      render json: { error: "招待コードを入力してください" }, status: :unprocessable_entity
      return
    end

    if current_user.partnership
      render json: { error: "既にパートナーシップが存在します" }, status: :unprocessable_entity
      return
    end

    invitation_code = InvitationCode.find_by(code: code.upcase, used: false)

    unless invitation_code
      render json: { error: "無効な招待コードです" }, status: :not_found
      return
    end

    if invitation_code.inviter_id == current_user.id
      render json: { error: "自分の招待コードは使用できません" }, status: :unprocessable_entity
      return
    end

    begin
      partnership = Partnership.create!(
        user: invitation_code.inviter,
        partner: current_user
      )

      invitation_code.mark_as_used!

      render json: {
        message: "パートナーシップが結ばれました",
        partnership: {
          id: partnership.id,
          user: {
            id: invitation_code.inviter.id,
            name: invitation_code.inviter.name
          },
          partner: {
            id: current_user.id,
            name: current_user.name
          }
        }
      }
    rescue ActiveRecord::RecordInvalid => e
      render json: {
        error: "パートナーシップの作成に失敗しました: #{e.message}"
      }, status: :unprocessable_entity
    end
  end
end
