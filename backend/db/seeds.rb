# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# テスト用ユーザーを作成
user1 = User.find_or_create_by!(email: 'test1@example.com') do |user|
  user.name = 'テストユーザー1'
end

user2 = User.find_or_create_by!(email: 'test2@example.com') do |user|
  user.name = 'テストユーザー2'
end

# ユーザー認証情報を作成
UserCredential.find_or_create_by!(user: user1) do |credential|
  credential.password = 'password123'
  credential.password_confirmation = 'password123'
end

UserCredential.find_or_create_by!(user: user2) do |credential|
  credential.password = 'password123'
  credential.password_confirmation = 'password123'
end

# パートナーシップを作成
partnership = Partnership.find_or_create_by!(user: user1, partner: user2)

# 二人の約束のデフォルトデータを作成
default_our_promises = [
  {
    content: "毎日お互いの一日を振り返る時間を作る",
    due_date: nil,
    type: "our_promise"
  },
  {
    content: "週末は一緒に新しいことにチャレンジする",
    due_date: nil,
    type: "our_promise"
  },
  {
    content: "月に一度はデートの時間を設ける",
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

puts "テストユーザーが作成されました:"
puts "ユーザー1: #{user1.email} (パスワード: password123)"
puts "ユーザー2: #{user2.email} (パスワード: password123)"
puts "二人の約束のデフォルトデータが作成されました"
