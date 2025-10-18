require 'rails_helper'

RSpec.describe EvaluationMailer, type: :mailer do
  let(:user) { create(:user) }
  let(:partner) { create(:user) }
  let(:partnership) { create(:partnership, user: user, partner: partner) }
  let(:promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

  describe '#weekly_evaluation_email' do
    let(:mail) { EvaluationMailer.weekly_evaluation_email(user, partner, promise) }

    it '宛先が正しい' do
      expect(mail.to).to include(partner.email)
    end

    it '件名が正しい' do
      expect(mail.subject).to eq('【約束の評価】今週の約束を評価してください')
    end

    it '評価URLが含まれる' do
      body_text = mail.html_part ? mail.html_part.body.to_s : mail.body.to_s
      expect(body_text).to include('evaluate')
      expect(body_text).to include(promise.id.to_s)
    end
  end

  describe '#due_date_evaluation_email' do
    let(:mail) { EvaluationMailer.due_date_evaluation_email(promise, partner) }

    it '宛先が正しい' do
      expect(mail.to).to include(partner.email)
    end

    it '件名が正しい' do
      expect(mail.subject).to eq('【約束の評価】期日が来た約束を評価してください')
    end
  end

  describe '.send_due_date_evaluations' do
    let!(:due_promise) do
      promise = create(:promise, partnership: partnership, creator: user, due_date: 1.day.from_now.to_date)
      promise.update_column(:due_date, Date.current)
      promise
    end

    let!(:future_promise) do
      create(:promise, partnership: partnership, creator: user, due_date: 7.days.from_now.to_date)
    end

    it '期日が来た約束の評価メールを送信する' do
      expect {
        EvaluationMailer.send_due_date_evaluations
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it '期日が来ていない約束にはメールを送信しない' do
      ActionMailer::Base.deliveries.clear
      EvaluationMailer.send_due_date_evaluations
      
      sent_emails = ActionMailer::Base.deliveries
      expect(sent_emails.count).to eq(1)
      expect(sent_emails.first.to).to include(partner.email)
    end
  end

  describe '.send_weekly_our_promises_evaluation' do
    let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: user) }

    it '週次評価メールを送信する' do
      expect {
        EvaluationMailer.send_weekly_our_promises_evaluation
      }.to change { ActionMailer::Base.deliveries.count }.by_at_least(1)
    end

    it '評価者にメールが送信される' do
      allow(Promise).to receive(:weekly_evaluator).with(partnership).and_return(partner)
      
      EvaluationMailer.send_weekly_our_promises_evaluation
      
      sent_email = ActionMailer::Base.deliveries.last
      expect(sent_email.to).to include(partner.email)
    end
  end
end

