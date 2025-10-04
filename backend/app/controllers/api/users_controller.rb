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

  def create
    user = User.new(user_params)

    if user.save
      credential = user.build_user_credential(credential_params)

      if credential.save
        # 新規ユーザー登録成功時にメールを送信
        begin
          RegistrationMailer.welcome_email(user).deliver_now
          Rails.logger.info "Welcome email sent successfully to #{user.email}"
        rescue => e
          Rails.logger.error "Failed to send welcome email to #{user.email}: #{e.message}"
          # メール送信に失敗してもユーザー登録は成功とする
        end

        # 招待コードが存在する場合はパートナーシップを作成
        if params[:invitation_code].present?
          invitation_code = InvitationCode.find_by(code: params[:invitation_code].upcase, used: false)
          if invitation_code && invitation_code.inviter_id != user.id
            partnership = Partnership.create!(
              user: invitation_code.inviter,
              partner: user
            )
            invitation_code.update!(used: true)
            Rails.logger.info "パートナーシップを作成しました: #{partnership.id}"
          end
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
      else
        user.destroy
        render json: { error: credential.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    else
      render json: { error: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email)
  end

  def credential_params
    params.require(:user_credential).permit(:password, :password_confirmation)
  end
end
