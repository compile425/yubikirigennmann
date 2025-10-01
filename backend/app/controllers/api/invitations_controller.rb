class Api::InvitationsController < ApplicationController
  before_action :authenticate_user!, only: [ :create, :index ]
  skip_before_action :authenticate_user!, only: [ :accept ], raise: false

  def create
    if current_user.partnership
      render json: { error: "既にパートナーシップが存在します" }, status: :unprocessable_entity
      return
    end

    invitation = current_user.invitations.build(
      token: generate_invitation_token
    )

    if invitation.save
      frontend_base_url = ENV.fetch('FRONTEND_BASE_URL', 'http://localhost:3000')
      
      render json: {
        message: "招待を作成しました",
        invitation: {
          id: invitation.id,
          token: invitation.token,
          invite_url: "#{frontend_base_url}/invite/#{invitation.token}"
        }
      }, status: :created
    else
      render json: { error: invitation.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def index
    invitations = current_user.invitations.includes(:inviter)
    render json: invitations
  end

  def accept
    invitation = Invitation.find_by(token: params[:token])

    unless invitation
      render json: { error: "無効な招待リンクです" }, status: :not_found
      return
    end

    if current_user
      partnership = Partnership.create!(
        user: invitation.inviter,
        partner: current_user
      )

      invitation.destroy

      render json: {
        message: "パートナーシップが作成されました",
        partnership: {
          id: partnership.id,
          user: invitation.inviter,
          partner: current_user
        }
      }
    else
      session[:pending_invitation_token] = invitation.token
      render json: {
        message: "ログインまたは新規登録してください",
        requires_auth: true
      }
    end
  end

  private

  def generate_invitation_token
    SecureRandom.urlsafe_base64(32)
  end
end
