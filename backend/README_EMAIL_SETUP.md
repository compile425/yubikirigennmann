# メール送信設定ガイド

## Gmail認証情報の設定

### 1. Gmailアプリパスワードの作成

1. Googleアカウントにログイン
2. [Google アカウント設定](https://myaccount.google.com/) にアクセス
3. 「セキュリティ」→「2段階認証プロセス」を有効にする
4. 「アプリパスワード」を選択
5. 「アプリを選択」→「その他（カスタム名）」を選択
6. 名前を入力（例：「ゆびきりげんまん」）
7. 「生成」をクリック
8. 表示された16文字のパスワードをコピー

### 2. 環境変数の設定

#### Docker環境の場合

`docker-compose.yml`の`api`サービスの`environment`セクションを編集：

```yaml
environment:
  DB_HOST: db
  MYSQL_ROOT_PASSWORD: password
  RAILS_ENV: development
  DISABLE_DATABASE_ENVIRONMENT_CHECK: '1'
  GMAIL_USERNAME: your-actual-email@gmail.com
  GMAIL_PASSWORD: your-16-character-app-password
```

#### ローカル環境の場合

`backend/.env`ファイルを作成（存在しない場合）：

```env
GMAIL_USERNAME=your-actual-email@gmail.com
GMAIL_PASSWORD=your-16-character-app-password
```

### 3. 設定の確認

設定後、以下のコマンドでメール送信をテストできます：

```bash
# Docker環境の場合
docker-compose exec api rails runner "ActionMailer::Base.mail(to: 'test@example.com', from: 'your-email@gmail.com', subject: 'Test', body: 'Test email').deliver_now"

# ローカル環境の場合
rails runner "ActionMailer::Base.mail(to: 'test@example.com', from: 'your-email@gmail.com', subject: 'Test', body: 'Test email').deliver_now"
```

### 4. 注意事項

- Gmailアプリパスワードは通常のパスワードとは異なります
- 2段階認証が有効になっている必要があります
- アプリパスワードは一度しか表示されないので、安全に保管してください
- 本番環境では、より安全な方法で認証情報を管理してください

### 5. トラブルシューティング

#### メールが送信されない場合

1. Gmailアプリパスワードが正しく設定されているか確認
2. 2段階認証が有効になっているか確認
3. Railsログでエラーメッセージを確認：
   ```bash
   docker-compose logs api
   ```

#### 認証エラーが発生する場合

1. アプリパスワードが正しくコピーされているか確認
2. Gmailアカウントの「安全性の低いアプリのアクセス」が有効になっているか確認
3. ファイアウォールやプロキシの設定を確認 