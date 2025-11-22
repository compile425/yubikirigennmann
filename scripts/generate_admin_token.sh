#!/bin/bash

# 本番環境のEC2インスタンスで管理者トークンを生成するスクリプト
# 使用方法: ./scripts/generate_admin_token.sh

set -euo pipefail

# 環境変数の確認
if [ -z "${AWS_REGION:-}" ]; then
  echo "❌ エラー: AWS_REGION環境変数が設定されていません"
  exit 1
fi

if [ -z "${EC2_INSTANCE_ID_1:-}" ]; then
  echo "❌ エラー: EC2_INSTANCE_ID_1環境変数が設定されていません"
  exit 1
fi

INSTANCE_ID="${EC2_INSTANCE_ID_1}"
REGION="${AWS_REGION}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 管理者トークンを生成中..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Instance ID: ${INSTANCE_ID}"
echo "Region: ${REGION}"
echo ""

# SSMコマンドを実行
command_id=$(aws ssm send-command \
  --region "${REGION}" \
  --instance-ids "${INSTANCE_ID}" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[
    'set -euo pipefail',
    'export HOME=/home/ec2-user',
    'export PATH=/usr/local/bin:/usr/bin:/bin',
    'cd /home/ec2-user/yubikirigennmann',
    'docker compose -f docker-compose.prod.yml exec -T api bin/rails admin:create_admin_token'
  ]" \
  --timeout-seconds 300 \
  --query "Command.CommandId" \
  --output text)

echo "Command ID: ${command_id}"
echo "実行中..."

# コマンドの完了を待つ
aws ssm wait command-executed \
  --region "${REGION}" \
  --command-id "${command_id}" \
  --instance-id "${INSTANCE_ID}"

# 結果を取得
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 実行結果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

output=$(aws ssm get-command-invocation \
  --region "${REGION}" \
  --command-id "${command_id}" \
  --instance-id "${INSTANCE_ID}" \
  --query "StandardOutputContent" \
  --output text)

error=$(aws ssm get-command-invocation \
  --region "${REGION}" \
  --command-id "${command_id}" \
  --instance-id "${INSTANCE_ID}" \
  --query "StandardErrorContent" \
  --output text)

if [ -n "${error}" ] && [ "${error}" != "None" ]; then
  echo "❌ エラー:"
  echo "${error}"
  exit 1
fi

echo "${output}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "完了"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "上記のトークンをGitHub Secretsの ADMIN_TOKEN に設定してください"

