#!/bin/bash
# ローカル環境でテストを実行するスクリプト
set -e

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# CI/CDと同じ環境変数を設定してテストを実行
docker-compose run --rm api \
  env \
    RAILS_ENV=test \
    DB_HOST=db \
    MYSQL_ROOT_PASSWORD=password \
    DATABASE_URL="mysql2://root:password@db:3306/myapp_test" \
  bin/test "$@"

