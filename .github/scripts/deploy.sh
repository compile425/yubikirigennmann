#!/bin/bash
set -euo pipefail

# 環境設定
export HOME=/home/ec2-user
export PATH=/usr/local/bin:/usr/bin:/bin

# 引数から環境変数を取得
DOT_ENV_BASE64="$1"
AWS_ACCOUNT_ID="$2"
AWS_REGION="$3"
ECR_REPOSITORY="$4"

# プロジェクトディレクトリに移動
cd /home/ec2-user/yubikirigennmann

# Git設定
git config --global --add safe.directory /home/ec2-user/yubikirigennmann
git config --global user.name 'EC2 Deploy'
git config --global user.email 'deploy@ec2.local'

echo "Fetching latest changes..."
git fetch origin main
echo "Resetting to latest main branch..."
git reset --hard origin/main

echo "Creating .env file from Base64 encoded content..."
echo "$DOT_ENV_BASE64" | base64 -d > .env

echo "Verifying .env file content..."
head -5 .env

echo "Creating docker-compose.prod.yml..."
cat > docker-compose.prod.yml << DOCKEREOF
services:
  api:
    image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
DOCKEREOF

echo "Verifying docker-compose.prod.yml..."
head -5 docker-compose.prod.yml

echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Pulling latest image..."
docker compose -f docker-compose.prod.yml pull api

echo "Running database migration..."
docker compose -f docker-compose.prod.yml run --rm api bundle exec rails db:migrate

echo "Starting application..."
docker compose -f docker-compose.prod.yml up -d --force-recreate --remove-orphans api

echo "Deployment completed. Checking application status..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "Deployment successful!"