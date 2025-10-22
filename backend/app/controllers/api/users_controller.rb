class Api::UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :me, :create ], raise: false

  def me
  # トークンを手動で検証
  if auth_header
    token = auth_header.split(" ")[1]
    begin
      decoded = decode_token(token)
      if decoded && decoded["user_id"]
    user = User.find_by(id: decoded["user_id"])
    if user
      partnership = user.partnership
      partner = partnership ? (partnership.user_id == user.id ? partnership.partner : partnership.user) : nil

      render json: {
        current_user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_inviter: partnership ? (partnership.user_id == user.id) : nil
        },
        partner: partner ? {
          id: partner.id,
          name: partner.name,
          email: partner.email
        } : nil
      }
      return
    end
      end
    rescue JWT::DecodeError => e
      Rails.logger.error "JWT decode error: #{e.message}"
    rescue => e
      Rails.logger.error "Token validation error: #{e.message}"
    end
  end

  render json: { error: "認証が必要です" }, status: :unauthorized
  end

  def stats
  unless current_user&.partnership
    render json: { error: "パートナーシップが存在しません" }, status: :unprocessable_entity
    return
  end

  partnership = current_user.partnership
  inviter = partnership.user
  invitee = partnership.partner

  render json: {
    inviter: {
      id: inviter.id,
      name: inviter.name,
      avatar_url: nil,
      average_score: inviter.average_score,
      score_trend: inviter.score_trend
    },
    invitee: {
      id: invitee.id,
      name: invitee.name,
      avatar_url: nil,
      average_score: invitee.average_score,
      score_trend: invitee.score_trend
    },
    monthly_apple_count: partnership.monthly_apple_count
  }
  end

  def create
  user = User.create_with_credential!(user_params, credential_params)

  # ウェルカムメール送信
  begin
    RegistrationMailer.welcome_email(user).deliver_now
  rescue => e
    Rails.logger.error "Failed to send welcome email to #{user.email}: #{e.message}"
  end

  token = encode_token(user_id: user.id)

  render json: {
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }, status: :created
  rescue ActiveRecord::RecordInvalid => e
  render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
  end

  private

  def user_params
  params.require(:user).permit(:name, :email)
  end

  def credential_params
  params.require(:user_credential).permit(:password, :password_confirmation)
  end
end
