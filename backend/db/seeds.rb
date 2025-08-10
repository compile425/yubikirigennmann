user1 = User.find_or_create_by!(email: 'test1@example.com') do |user|
  user.name = 'テストユーザー1'
end

user2 = User.find_or_create_by!(email: 'test2@example.com') do |user|
  user.name = 'テストユーザー2'
end

UserCredential.find_or_create_by!(user: user1) do |credential|
  credential.password = 'password123'
  credential.password_confirmation = 'password123'
end

UserCredential.find_or_create_by!(user: user2) do |credential|
  credential.password = 'password123'
  credential.password_confirmation = 'password123'
end

partnership = Partnership.find_or_create_by!(user: user1, partner: user2)

default_our_promises = [
  {
    content: "毎日お互いの気持ちを共有する時間を作る",
    due_date: nil,
    type: "our_promise"
  },
  {
    content: "週に一度は一緒に料理を作る",
    due_date: nil,
    type: "our_promise"
  },
  {
    content: "月に一度は新しい場所に出かける",
    due_date: nil,
    type: "our_promise"
  }
]

default_our_promises.each do |promise_data|
  Promise.find_or_create_by!(
    content: promise_data[:content],
    partnership: partnership,
    creator: user1,
    type: promise_data[:type]
  ) do |promise|
    promise.due_date = promise_data[:due_date]
  end
end
personal_promises = [
  {
    content: "毎日30分運動する",
    due_date: Date.current + 30.days,
    type: "personal_promise",
    creator: user1
  },
  {
    content: "週に3回料理を作る",
    due_date: Date.current + 14.days,
    type: "personal_promise",
    creator: user1
  },
  {
    content: "毎日読書を1時間する",
    due_date: Date.current + 21.days,
    type: "personal_promise",
    creator: user2
  },
  {
    content: "週末に新しいスキルを学ぶ",
    due_date: Date.current + 60.days,
    type: "personal_promise",
    creator: user2
  }
]

personal_promises.each do |promise_data|
  Promise.find_or_create_by!(
    content: promise_data[:content],
    partnership: partnership,
    creator: promise_data[:creator],
    type: promise_data[:type]
  ) do |promise|
    promise.due_date = promise_data[:due_date]
  end
end

evaluated_promises = [
  {
    content: "毎日30分運動する",
    rating: 4,
    evaluation_text: "頑張って続けられました！少しずつでも継続できて良かったです。",
    evaluator: user2,
    created_at: 2.weeks.ago
  },
  {
    content: "週に3回料理を作る",
    rating: 5,
    evaluation_text: "とても美味しい料理を作ってくれて、毎週楽しみでした！",
    evaluator: user2,
    created_at: 1.week.ago
  },
  {
    content: "毎日読書を1時間する",
    rating: 3,
    evaluation_text: "時間を作るのが大変そうでしたが、頑張っていました。",
    evaluator: user1,
    created_at: 3.days.ago
  },
  {
    content: "週末に新しいスキルを学ぶ",
    rating: 4,
    evaluation_text: "新しいことに挑戦する姿が素晴らしかったです。",
    evaluator: user1,
    created_at: 1.day.ago
  },
  {
    content: "毎日お互いの一日を振り返る時間を作る",
    rating: 5,
    evaluation_text: "お互いのことをより深く理解できるようになりました。",
    evaluator: user1,
    created_at: 1.week.ago
  },
  {
    content: "週末は一緒に新しいことにチャレンジする",
    rating: 4,
    evaluation_text: "楽しい時間を過ごせました。また新しいことに挑戦しましょう！",
    evaluator: user2,
    created_at: 5.days.ago
  }
]

evaluated_promises.each do |evaluation_data|
  promise = Promise.find_by(content: evaluation_data[:content])
  if promise
    PromiseEvaluation.find_or_create_by!(promise: promise) do |evaluation|
      evaluation.rating = evaluation_data[:rating]
      evaluation.evaluation_text = evaluation_data[:evaluation_text]
      evaluation.evaluator = evaluation_data[:evaluator]
      evaluation.created_at = evaluation_data[:created_at]
      evaluation.updated_at = evaluation_data[:created_at]
    end
  end
end

puts "テストユーザーが作成されました:"
puts "ユーザー1: #{user1.email} (パスワード: password123)"
puts "ユーザー2: #{user2.email} (パスワード: password123)"
puts "二人の約束のデフォルトデータが作成されました"
puts "過去の評価データが作成されました"
