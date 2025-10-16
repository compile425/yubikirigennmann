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

    invitation_code = InvitationCode.find_by(code: code.upcase, used: false)

    unless invitation_code
      render json: { error: "無効な招待コードです" }, status: :not_found
      return
    end

    partnership = invitation_code.join_partnership!(current_user)

    render json: {
      message: "パートナーシップが結ばれました",
      partnership: {
        id: partnership.id,
        user: {
          id: partnership.user.id,
          name: partnership.user.name
        },
        partner: {
          id: partnership.partner.id,
          name: partnership.partner.name
        }
      }
    }
  rescue ArgumentError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: {
      error: "パートナーシップの作成に失敗しました",
      details: e.record.errors.full_messages
    }, status: :unprocessable_entity
  end
end
