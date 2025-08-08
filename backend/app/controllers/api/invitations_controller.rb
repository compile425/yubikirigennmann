class Api::InvitationsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :index]
  skip_before_action :authenticate_user!, only: [:accept], raise: false

  def create
    # 既にパートナーシップがある場合はエラー
    if current_user.partnership
      render json: { error: '既にパートナーシップが存在します' }, status: :unprocessable_entity
      return
    end

    # 招待を作成
    invitation = current_user.invitations.build(
      invitee_email: params[:invitee_email],
      token: generate_invitation_token
    )

    if invitation.save
      render json: {
        message: '招待を作成しました',
        invitation: {
          id: invitation.id,
          token: invitation.token,
          invite_url: "#{request.base_url}/invite/#{invitation.token}"
        }
      }, status: :created
    else
      render json: { error: invitation.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def index
    invitations = current_user.invitations.includes(:inviter)
    render json: invitations
  end

  def accept
    invitation = Invitation.find_by(token: params[:token])
    
    unless invitation
      render json: { error: '無効な招待リンクです' }, status: :not_found
      return
    end

    # 招待を受け取ったユーザーがログインしている場合
    if current_user
      # パートナーシップを作成
      partnership = Partnership.create!(
        user: invitation.inviter,
        partner: current_user
      )
      
      # 招待を削除
      invitation.destroy
      
      render json: {
        message: 'パートナーシップが作成されました',
        partnership: {
          id: partnership.id,
          user: invitation.inviter,
          partner: current_user
        }
      }
    else
      # ログインしていない場合は、招待情報をセッションに保存
      session[:pending_invitation_token] = invitation.token
      render json: {
        message: 'ログインまたは新規登録してください',
        requires_auth: true
      }
    end
  end

  private

  def generate_invitation_token
    SecureRandom.urlsafe_base64(32)
  end
end 