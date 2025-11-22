class Api::SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :create, :guest_login ]

  def create
    user = User.find_by(email: params[:email])

    if user&.user_credential&.authenticate(params[:password])
      token = encode_token(user_id: user.id)
      render json: { token: token }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def guest_login
    guest_user = User.find_or_create_by!(email: "test1@example.com") do |u|
      u.name = "テストユーザー1"
    end
    UserCredential.find_or_create_by!(user: guest_user) do |cred|
      cred.password = "password123"
      cred.password_confirmation = "password123"
    end

    # ゲストユーザー用のパートナーシップを設定
    ensure_guest_partnership_and_pending_promise(guest_user)

    token = encode_token(user_id: guest_user.id)
    render json: { token:, message: "ゲストユーザーとしてログインしました" }, status: :ok
  end

  private

  # ゲストユーザー用のパートナーシップと評価待ちの約束を確保
  def ensure_guest_partnership_and_pending_promise(guest_user)
    # ゲストユーザー2を取得または作成
    guest_partner = User.find_or_create_by!(email: "test2@example.com") do |u|
      u.name = "テストユーザー2"
    end
    UserCredential.find_or_create_by!(user: guest_partner) do |cred|
      cred.password = "password123"
      cred.password_confirmation = "password123"
    end

    # パートナーシップを取得または作成
    partnership = Partnership.find_or_create_by!(user: guest_user, partner: guest_partner) do |p|
      # パートナーシップ作成時にデフォルトの約束を作成
      p.save!
      p.create_default_promises
    end

    # 既存のパートナーシップでデフォルトの約束がない場合は作成
    if partnership.promises.our_promises.empty?
      partnership.create_default_promises
    end

    # 評価待ちの約束が存在するか確認
    today = Date.today
    pending_promises = partnership.pending_evaluations_for(guest_user)

    # 評価待ちの約束がない場合、1件作成
    if pending_promises.empty?
      partnership.promises.create!(
        content: "ゲストログイン時のサンプル約束です。この約束を評価してみてください。",
        type: "personal_promise",
        creator: guest_partner, # パートナーが作成者（ゲストユーザーが評価する）
        due_date: today # 期日を今日に設定（評価待ちになる）
      )
    end
  end
end
