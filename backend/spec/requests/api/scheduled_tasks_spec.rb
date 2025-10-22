require 'rails_helper'

RSpec.describe 'Api::ScheduledTasks', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'POST /api/scheduled_tasks/send_due_date_evaluations' do
    let(:partnership) { create(:partnership) }
    let!(:due_promise) do
      promise = create(:promise, partnership: partnership, creator: partnership.user, due_date: 1.day.from_now.to_date)
      promise.update_column(:due_date, Date.current)
      promise
    end

    it '200ステータスを返す' do
      post '/api/scheduled_tasks/send_due_date_evaluations', headers: headers
      expect(response).to have_http_status(:ok)
    end

    it '成功メッセージを返す' do
      post '/api/scheduled_tasks/send_due_date_evaluations', headers: headers
      json = json_response
      expect(json['message']).to eq('期日が来た約束の評価メールを送信しました')
    end

    it 'メールが送信される' do
      expect {
        post '/api/scheduled_tasks/send_due_date_evaluations', headers: headers
      }.to change { ActionMailer::Base.deliveries.count }.by_at_least(1)
    end
  end

  describe 'POST /api/scheduled_tasks/send_weekly_our_promises_evaluation' do
    let(:partnership) { create(:partnership) }
    let!(:our_promise) { create(:promise, :our_promise, partnership: partnership, creator: partnership.user) }

    it '200ステータスを返す' do
      post '/api/scheduled_tasks/send_weekly_our_promises_evaluation', headers: headers
      expect(response).to have_http_status(:ok)
    end

    it '成功メッセージを返す' do
      post '/api/scheduled_tasks/send_weekly_our_promises_evaluation', headers: headers
      json = json_response
      expect(json['message']).to eq('毎週の二人の約束評価メールを送信しました')
    end

    it 'メールが送信される' do
      expect {
        post '/api/scheduled_tasks/send_weekly_our_promises_evaluation', headers: headers
      }.to change { ActionMailer::Base.deliveries.count }.by_at_least(1)
    end
  end

  describe 'POST /api/scheduled_tasks/reset_our_promises_for_weekly_evaluation' do
    let(:partnership) { create(:partnership) }
    let!(:our_promise1) { create(:promise, :with_evaluation, :our_promise, partnership: partnership, creator: partnership.user) }
    let!(:our_promise2) { create(:promise, :with_evaluation, :our_promise, partnership: partnership, creator: partnership.user) }
    let!(:our_promise_no_eval) { create(:promise, :our_promise, partnership: partnership, creator: partnership.user) }

    it '200ステータスを返す' do
      post '/api/scheduled_tasks/reset_our_promises_for_weekly_evaluation', headers: headers
      expect(response).to have_http_status(:ok)
    end

    it '成功メッセージとリセット件数を返す' do
      post '/api/scheduled_tasks/reset_our_promises_for_weekly_evaluation', headers: headers
      json = json_response
      expect(json['message']).to include('件のふたりの約束をリセットしました')
      expect(json['count']).to eq(2)
    end

    it '評価済みのふたりの約束をリセットする' do
      expect {
        post '/api/scheduled_tasks/reset_our_promises_for_weekly_evaluation', headers: headers
      }.to change(PromiseEvaluation, :count).by(-2)
    end

    it '評価がない約束には影響しない' do
      post '/api/scheduled_tasks/reset_our_promises_for_weekly_evaluation', headers: headers
      expect(our_promise_no_eval.reload.promise_evaluation).to be_nil
    end
  end

  describe 'POST /api/scheduled_tasks/send_monthly_reports' do
    let!(:partnership1) { create(:partnership) }
    let!(:partnership2) { create(:partnership) }

    before do
      last_month = Date.current.beginning_of_month - 1.month

      [ partnership1, partnership2 ].each do |p|
        p.promise_rating_scores.create!(
          year_month: last_month,
          harvested_apples: 5
        )
      end
    end

    it '200ステータスを返す' do
      post '/api/scheduled_tasks/send_monthly_reports', headers: headers
      expect(response).to have_http_status(:ok)
    end

    it '成功メッセージを返す' do
      post '/api/scheduled_tasks/send_monthly_reports', headers: headers
      json = json_response
      expect(json['message']).to eq('月次レポートを送信しました')
    end

    it 'メールが送信される' do
      expect {
        post '/api/scheduled_tasks/send_monthly_reports', headers: headers
      }.to change { ActionMailer::Base.deliveries.count }.by(4)
    end
  end
end
