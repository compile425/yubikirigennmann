namespace :admin do
  desc "管理者ユーザーを作成してトークンを生成"
  task create_admin_token: :environment do
    admin_email = ENV.fetch("ADMIN_EMAIL", "admin@yubikirigenman.com")
    admin_name = ENV.fetch("ADMIN_NAME", "System Admin")
    
    admin = User.find_or_initialize_by(email: admin_email)
    
    if admin.new_record?
      admin.name = admin_name
      admin.save!
      password = SecureRandom.hex(32)
      admin.create_user_credential!(
        password: password,
        password_confirmation: password
      )
      puts "✅ 管理者ユーザーを作成しました"
    else
      puts "ℹ️  管理者ユーザーは既に存在します"
    end
    
    payload = { user_id: admin.id }
    token = JWT.encode(payload, Rails.application.credentials.secret_key_base)
    
    puts "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "📋 管理者情報"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "Email: #{admin.email}"
    puts "Name:  #{admin.name}"
    puts "\n🔑 ADMIN_TOKEN（GitHub Secretsに設定してください）:"
    puts token
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  end

  desc "既存ユーザーのトークンを生成"
  task :generate_token, [:email] => :environment do |_t, args|
    unless args[:email]
      puts "❌ エラー: メールアドレスを指定してください"
      puts "使用例: bin/rails admin:generate_token[user@example.com]"
      exit 1
    end
    
    user = User.find_by(email: args[:email])
    
    unless user
      puts "❌ エラー: ユーザーが見つかりません（#{args[:email]}）"
      exit 1
    end
    
    payload = { user_id: user.id }
    token = JWT.encode(payload, Rails.application.credentials.secret_key_base)
    
    puts "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "📋 ユーザー情報"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "Email: #{user.email}"
    puts "Name:  #{user.name}"
    puts "\n🔑 トークン:"
    puts token
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  end

  desc "トークンをデコードしてユーザー情報を表示"
  task :decode_token, [:token] => :environment do |_t, args|
    unless args[:token]
      puts "❌ エラー: トークンを指定してください"
      puts "使用例: bin/rails admin:decode_token[your_token_here]"
      exit 1
    end
    
    begin
      decoded = JWT.decode(args[:token], Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
      user_id = decoded[0]['user_id']
      user = User.find_by(id: user_id)
      
      if user
        puts "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        puts "✅ トークンは有効です"
        puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        puts "User ID: #{user.id}"
        puts "Email:   #{user.email}"
        puts "Name:    #{user.name}"
        puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      else
        puts "⚠️  トークンは有効ですが、ユーザーが見つかりません（ID: #{user_id}）"
      end
    rescue JWT::DecodeError => e
      puts "❌ エラー: トークンが無効です"
      puts "理由: #{e.message}"
      exit 1
    end
  end

  desc "ゲストユーザーのデータをリセット"
  task reset_guest_data: :environment do
    puts "\n🔄 ゲストユーザーのデータをリセットしています...\n"
    
    user1 = User.find_by(email: 'test1@example.com')
    user2 = User.find_by(email: 'test2@example.com')
    
    unless user1 && user2
      puts "❌ ゲストユーザーが見つかりません"
      puts "先に bin/rails db:seed を実行してください"
      exit 1
    end
    
    partnership = Partnership.find_by(user: user1, partner: user2)
    
    unless partnership
      puts "❌ パートナーシップが見つかりません"
      exit 1
    end
    
    # 既存の評価データとアップルカウントをクリア
    partnership.promises.each do |promise|
      promise.promise_evaluation&.destroy
    end
    partnership.promise_rating_scores.destroy_all
    partnership.promises.destroy_all
    
    # ゲストユーザーのアップルカウントを5で初期化
    current_month = Date.current.beginning_of_month
    partnership.promise_rating_scores.create!(
      year_month: current_month,
      harvested_apples: 5
    )
    
    # デフォルトの約束を再作成
    partnership.create_default_promises
    
    puts "✅ ゲストユーザーのデータをリセットしました"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "アップルカウント: 5個"
    puts "デフォルトの約束: 3個"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  end

  desc "スケジュールタスクをテスト実行"
  task test_scheduled_tasks: :environment do
    puts "\n🧪 スケジュールタスクのテスト実行\n"
    
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "1. 期日メール送信のテスト"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    begin
      EvaluationMailer.send_due_date_evaluations
      puts "✅ 期日メール送信: 成功\n"
    rescue => e
      puts "❌ 期日メール送信: 失敗"
      puts "エラー: #{e.message}\n"
    end
    
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "2. 週次評価メール送信のテスト"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    begin
      EvaluationMailer.send_weekly_our_promises_evaluation
      puts "✅ 週次評価メール送信: 成功\n"
    rescue => e
      puts "❌ 週次評価メール送信: 失敗"
      puts "エラー: #{e.message}\n"
    end
    
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "3. 月次レポート送信のテスト"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    begin
      MonthlyReportMailer.send_monthly_reports
      puts "✅ 月次レポート送信: 成功\n"
    rescue => e
      puts "❌ 月次レポート送信: 失敗"
      puts "エラー: #{e.message}\n"
    end
    
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    puts "テスト完了"
    puts "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  end
end

