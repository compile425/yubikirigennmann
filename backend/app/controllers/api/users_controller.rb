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
    inviter = User.find(partnership.user_id)
    invitee = User.find(partnership.partner_id)

    # 現在のユーザーが招待者かどうかを判定
    current_is_inviter = current_user.id == partnership.user_id

    # 左側（招待者）、右側（被招待者）の順でデータを整理
    left_user = inviter
    right_user = invitee

    # 月間りんご数の計算（仮実装）
    monthly_apple_count = partnership.promise_rating_scores.sum(:harvested_apples)

    render json: {
      inviter: {
        id: left_user.id,
        name: left_user.name,
        avatar_url: nil, # アバター機能は後で実装
        average_score: calculate_average_score(left_user),
        score_trend: calculate_score_trend(left_user)
      },
      invitee: {
        id: right_user.id,
        name: right_user.name,
        avatar_url: nil, # アバター機能は後で実装
        average_score: calculate_average_score(right_user),
        score_trend: calculate_score_trend(right_user)
      },
      monthly_apple_count: monthly_apple_count
    }
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

  private

  def calculate_average_score(user)
    # ユーザーが評価した約束の平均スコアを計算
    evaluations = user.evaluated_promises
    return 0.0 if evaluations.empty?

    total_score = evaluations.sum(:rating)
    count = evaluations.count
    count > 0 ? total_score.to_f / count : 0.0
  end

  def calculate_score_trend(user)
    # 先月からのスコアトレンドを計算（仮実装）
    current_month = Date.current.beginning_of_month
    last_month = current_month - 1.month

    current_score = calculate_monthly_average_score(user, current_month)
    last_score = calculate_monthly_average_score(user, last_month)

    current_score - last_score
  end

  def calculate_monthly_average_score(user, month_start)
    evaluations = user.evaluated_promises
      .where("created_at >= ? AND created_at < ?",
             month_start, month_start + 1.month)

    return 0.0 if evaluations.empty?

    total_score = evaluations.sum(:rating)
    count = evaluations.count
    count > 0 ? total_score.to_f / count : 0.0
  end
end
