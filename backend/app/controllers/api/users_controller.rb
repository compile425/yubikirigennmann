class Api::UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: [:me, :create], raise: false
  
  def me
    if current_user
      partnership = current_user.partnership
      partner = partnership ? (partnership.user_id == current_user.id ? partnership.partner : partnership.user) : nil
      
      render json: {
        current_user: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email
        },
        partner: partner ? {
          id: partner.id,
          name: partner.name,
          email: partner.email
        } : nil
      }
    else
      render json: { error: '認証が必要です' }, status: :unauthorized
    end
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
        
        # 招待トークンが存在する場合はパートナーシップを作成
        if params[:invitation_token].present?
          invitation = Invitation.find_by(token: params[:invitation_token])
          if invitation && invitation.inviter_id != user.id
            partnership = Partnership.create!(
              user: invitation.inviter,
              partner: user
            )
            invitation.destroy
            Rails.logger.info "パートナーシップを作成しました: #{partnership.id}"
          end
        end
        
        token = JWT.encode(
          { user_id: user.id, exp: 24.hours.from_now.to_i },
          Rails.application.secret_key_base
        )
        
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
        render json: { error: credential.errors.full_messages.join(', ') }, status: :unprocessable_entity
      end
    else
      render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
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