require 'rails_helper'

RSpec.describe MonthlyReportMailer, type: :mailer do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:target_month) { Date.new(2025, 1, 1) }
  let(:stats) do
    {
      user: { name: user.name, average_score: 4.5, evaluation_count: 10 },
      partner: { name: partner.name, average_score: 4.2, evaluation_count: 8 },
      apple_count: 12,
      year_month: target_month
    }
  end

  describe '#monthly_report' do
    let(:mail) { MonthlyReportMailer.monthly_report(user, stats) }

    it '宛先が正しい' do
      expect(mail.to).to include(user.email)
    end

    it '件名が正しい' do
      expect(mail.subject).to eq('【ゆびきりげんまん】2025年1月のレポート')
    end

    it 'ユーザー名が含まれる' do
      body_text = mail.html_part.body.to_s
      expect(body_text).to include(user.name)
    end

    it '統計情報が含まれる' do
      body_text = mail.html_part.body.to_s
      expect(body_text).to include('4.5')
      expect(body_text).to include('10')
      expect(body_text).to include('12')
    end

    it 'パートナー名が含まれる' do
      body_text = mail.html_part.body.to_s
      expect(body_text).to include(partner.name)
    end
  end

  describe '.send_monthly_reports' do
    let!(:partnership1) { create(:partnership) }
    let!(:partnership2) { create(:partnership) }

    before do
      last_month = Date.current.beginning_of_month - 1.month
      
      [partnership1, partnership2].each do |p|
        p.promise_rating_scores.create!(
          year_month: last_month,
          harvested_apples: 5
        )
      end
    end

    it 'メールが送信される' do
      expect {
        MonthlyReportMailer.send_monthly_reports
      }.to change { ActionMailer::Base.deliveries.count }.by(4)
    end

    it '各ユーザーにメールが送信される' do
      MonthlyReportMailer.send_monthly_reports
      
      emails = ActionMailer::Base.deliveries.last(4)
      recipients = emails.map(&:to).flatten
      
      expect(recipients).to include(partnership1.user.email)
      expect(recipients).to include(partnership1.partner.email)
      expect(recipients).to include(partnership2.user.email)
      expect(recipients).to include(partnership2.partner.email)
    end
  end
end
