# Preview all emails at http://localhost:3000/rails/mailers/monthly_report_mailer
class MonthlyReportMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/monthly_report_mailer/monthly_summary_email
  def monthly_summary_email
    MonthlyReportMailer.monthly_summary_email
  end

end
