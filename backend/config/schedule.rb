# 毎日午後10時: 期日が来た約束の評価メールを送信
every 1.day, at: "10:00 pm" do
  runner "EvaluationMailer.send_due_date_evaluations"
end

# 毎週日曜日午後8時: ふたりの約束の評価サイクル
# 1. 評価済みの約束をリセット（評価待ちに戻す）
# 2. 評価者にメールを送信
every :sunday, at: "8:00 pm" do
  # まず評価済みの約束をリセット
  rake "promises:reset_weekly_evaluations"
  
  # その後、評価者にメールを送信
  runner "EvaluationMailer.send_weekly_our_promises_evaluation"
end
