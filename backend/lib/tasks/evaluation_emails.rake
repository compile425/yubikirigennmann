namespace :evaluation_emails do
  desc "テスト用：評価メールを手動で送信"
  task send_test: :environment do
    puts "評価メールのテスト送信を開始します..."
    
    begin
      EvaluationMailer.send_weekly_evaluation_emails
      puts "✅ 評価メールの送信が完了しました"
    rescue => e
      puts "❌ エラーが発生しました: #{e.message}"
      puts e.backtrace.join("\n")
    end
  end

  desc "パートナーシップの一覧を表示"
  task list_partnerships: :environment do
    puts "パートナーシップ一覧:"
    Partnership.includes(:user, :partner, :promises).each do |partnership|
      puts "ID: #{partnership.id}"
      puts "  User: #{partnership.user.name} (#{partnership.user.email})"
      puts "  Partner: #{partnership.partner.name} (#{partnership.partner.email})"
      puts "  Our Promises: #{partnership.promises.where(type: 'our_promise').count}件"
      puts "---"
    end
  end
end 