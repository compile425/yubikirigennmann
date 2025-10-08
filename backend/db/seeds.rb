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

# パートナーシップにデフォルトの約束を自動作成
partnership.create_default_promises

puts "テストユーザーが作成されました:"
puts "ユーザー1: #{user1.email} (パスワード: password123)"
puts "ユーザー2: #{user2.email} (パスワード: password123)"
puts "パートナーシップとデフォルトの約束が作成されました"
