class MonthlyReportMailer < ApplicationMailer
  def monthly_report(user, stats)
  @user = user
  @stats = stats
  @year = stats[:year_month].year
  @month = stats[:year_month].month

  mail(
    to: user.email,
    subject: "【ゆびきりげんまん】#{@year}年#{@month}月のレポート"
  )
  end

  def self.send_monthly_reports
  last_month = Date.current.beginning_of_month - 1.month

  Partnership.includes(:user, :partner).find_each do |partnership|
    [ partnership.user, partnership.partner ].each do |user|
      stats = partnership.monthly_stats(user, last_month)

      begin
    monthly_report(user, stats).deliver_now
      rescue => e
    Rails.logger.error "Failed to send monthly report to #{user.email}: #{e.message}"
      end
    end
  end
  end
end
