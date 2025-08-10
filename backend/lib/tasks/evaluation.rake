namespace :evaluation do
  desc "期日が来た約束の評価メールを送信"
  task send_due_date_evaluations: :environment do
    puts "期日が来た約束の評価メールを送信中..."
    EvaluationMailer.send_due_date_evaluations
    puts "送信完了"
  end

  desc "毎週の二人の約束評価メールを送信"
  task send_weekly_our_promises_evaluation: :environment do
    puts "毎週の二人の約束評価メールを送信中..."
    EvaluationMailer.send_weekly_our_promises_evaluation
    puts "送信完了"
  end

  desc "テスト用：期日が来た約束の評価メールを送信（今日の日付で）"
  task test_due_date_evaluations: :environment do
    puts "テスト用：期日が来た約束の評価メールを送信中..."
    today = Date.current
    partnership = Partnership.first
    if partnership
      promise = Promise.create!(
        content: "テスト用の約束（期日: #{today}）",
        due_date: today,
        type: "personal_promise",
        creator: partnership.user,
        partnership: partnership
      )
      puts "テスト用約束を作成: #{promise.content}"
      EvaluationMailer.send_due_date_evaluations
      puts "送信完了"
    else
      puts "パートナーシップが見つかりません"
    end
  end
end
