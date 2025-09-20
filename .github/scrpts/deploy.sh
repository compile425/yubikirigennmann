#!/bin/bash
set -euo pipefail

echo "$DOT_ENV_PRODUCTION" > /home/ec2-user/yubikirigennmann/.env

cd /home/ec2-user/yubikirigennmann
git pull origin main

cat << EOF > docker-compose.prod.yml
services:
  api:
    image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_API_REPOSITORY}:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
EOF

aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

docker compose -f docker-compose.prod.yml pull api
docker compose -f docker-compose.prod.yml run --rm api bundle exec rails db:migrate
docker compose -f docker-compose.prod.yml up -d --remove-orphans api

echo "Deployment completed successfully."