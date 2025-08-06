# ゆびきりげんまん - 自動評価メール機能

## 機能概要

毎週日曜日の21時に、  
二人の約束の一番上にある約束を評価してもらうための  
メールを自動で送信する機能を実装しています。  

## 実装済み機能

### バックエンド (Rails)
・`EvaluationMailer` - 評価メール送信機能  
・`evaluation_emails_controller` - API エンドポイント  
・メールテンプレート (`weekly_evaluation_email.html.erb`)  
・スケジュール設定 (`config/schedule.rb`)  
・テスト用タスク (`lib/tasks/evaluation_emails.rake`)  

### フロントエンド (React)
・評価メール送信ボタン  
・ローディング状態の表示  
・エラーハンドリング  

## 設定手順

### 1. 環境変数の設定

`backend/.env` ファイルを編集して、Gmailの認証情報を設定してください：

```bash
# Gmail SMTP設定
GMAIL_USERNAME=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

**注意**: `GMAIL_PASSWORD` には通常のパスワードではなく、Gmailの「アプリパスワード」を使用してください。

### 2. Gmailアプリパスワードの取得

1. Googleアカウントの設定にアクセス  
2. セキュリティ → 2段階認証を有効化  
3. アプリパスワードを生成  
4. 生成されたパスワードを `.env` ファイルに設定  

### 3. スケジュールタスクの設定

```bash
cd backend
bundle exec whenever --update-crontab
```

### 4. テスト実行

```bash
# パートナーシップ一覧の確認
bundle exec rake evaluation_emails:list_partnerships

# テスト用メール送信
bundle exec rake evaluation_emails:send_test
```

## 動作確認

### 手動テスト
1. フロントエンドで「評価メールを送信」ボタンをクリック
2. コンソールで送信結果を確認
3. 受信者のメールボックスでメールを確認

### 自動テスト
毎週日曜日の21時に自動でメールが送信されます。

## トラブルシューティング

### メールが送信されない場合
1. `.env` ファイルの設定を確認  
2. Gmailアプリパスワードが正しく設定されているか確認  
3. ログを確認: `tail -f backend/log/development.log`

### スケジュールタスクが動作しない場合
1. cronジョブの確認: `crontab -l`  
2. wheneverの再設定: `bundle exec whenever --update-crontab`

## 技術仕様
・**メール送信**: Action Mailer + SMTP (Gmail)  
・**スケジュール**: whenever gem + cron  
・**認証**: JWT トークン  
・**フロントエンド**: React + TypeScript  
・**バックエンド**: Rails 7.2 + MySQL  
