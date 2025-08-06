every 1.day, at: '9:00 am' do
  runner "EvaluationMailer.send_due_date_evaluations"
end

every :sunday, at: '9:00 pm' do
  runner "EvaluationMailer.send_weekly_our_promises_evaluation"
end 