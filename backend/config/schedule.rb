every 1.day, at: "9:00 pm" do
  runner "EvaluationMailer.send_due_date_evaluations"
end

every :sunday, at: "8:00 pm" do
  runner "EvaluationMailer.send_weekly_our_promises_evaluation"
end

every 1.month, at: "end of month at 10:00 pm" do
  runner "MonthlyReportMailer.send_monthly_reports"
end
