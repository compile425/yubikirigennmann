#!/bin/bash
set -e

rm -f /app/tmp/pids/server.pid

# 開発環境の場合、データベースのセットアップとシードを実行
if [ "$RAILS_ENV" = "development" ]; then
  echo "開発環境: データベースのセットアップを実行します..."
  
  # データベースが存在しない場合は作成
  bundle exec rails db:create 2>/dev/null || true
  
  # マイグレーションを実行
  bundle exec rails db:migrate
  
  # シードを実行（サンプルユーザー作成）
  bundle exec rails db:seed
  
  echo "データベースのセットアップが完了しました"
fi

exec "$@"