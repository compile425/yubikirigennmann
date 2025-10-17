## 概要
「ゆびきりげんまん」は大切な人との約束を守り、  
すれ違いをなくすことで関係性の向上をサポートするサービスです。


## オリジナルプロダクトのURL
<https://yubikirigenman.com>

## サービスへの想い
本プロダクトは、二人の約束事を大切にし、  
恋人、夫婦の関係性をより良くしたい人に向けてすれ違いをなくす手伝いをしたい　 
という想いから開発をしました。  

人と人の関係性において最も大切なことが信頼だと考えています。  
そしてその信頼を形成するために必要なのが約束を守ること。  

ただ、本人が約束を守れたと思っていても  
『相手からしたら守れてなかった』となれば意味がありません。  

自分自身も上記の経験をしたことがあったため本プロダクトでは、  

相手から約束が守れてるかの評価をしてもらい  
『約束を守ったと思っていてができてなかった』というすれ違いを無くすサポートをします。  

またタスク管理ツールのように約束を一覧で管理できるようにすることで  
「そんなこと言ったっけ？」と言ったすれ違いも解消します。  

相手との信頼を形成する上で大事なのは相手から見たときの評価です。  

本プロダクトが相手からの評価を可視化し、  
お互いがお互いのために約束を守り信頼関係を形成していく。  

そして関係性の向上によって世のパートナー達の幸福度を上げる。  

そのサポートができることを目指しています。

## 画面キャプチャ

## 使用技術

| Category       | Technology Stack                                                                          |
| :------------- | :---------------------------------------------------------------------------------------- |
| **Frontend**     | TypeScript (`~5.8.3`), React (`^19.1.0`), CSS, Vite                                       |
| **Backend**      | Ruby (`3.4.5`), Ruby on Rails (`~> 7.2.2, >= 7.2.2.1`)                                    |
| **Infrastructure** | Amazon Web Services (S3, CloudFront, EC2, RDS, Route 53, ALB, ECR), Sentry, Docker, Docker Compose |
| **Database**     | MySQL (`8.4`)                                                                             |
| **Testing**      | RSpec, ESLint                                                                             |
| **CI/CD**        | GitHub Actions                                                                            |
| **etc.**         | draw.io, Git, GitHub                                                                      |

## ER図
```mermaid
erDiagram
    users ||--o| user_credentials : "has_one"
    users ||--o{ invitation_codes : "creates"
    users |o--o| partnerships : "forms"
    users ||--o{ promises : "creates"
    users ||--o{ promise_evaluations : "evaluates"
    users ||--o{ one_words : "sends/receives"
    
    partnerships ||--o{ promises : "has_many"
    partnerships ||--o{ one_words : "has_many"
    partnerships ||--o{ promise_rating_scores : "has_many"
    
    promises ||--o| promise_evaluations : "has_one"
    promises ||--o{ promise_histories : "has_many"
    promises }o--o| promises : "sub-promise of"

    users {
        bigint id PK "ユーザーID"
        string email UK "メールアドレス"
        string name "氏名"
        string reset_password_token UK "パスワードリセットトークン"
        datetime reset_password_sent_at "リセットトークン送信日時"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    user_credentials {
        bigint id PK "認証情報ID"
        bigint user_id FK "ユーザーID"
        string password_digest "ハッシュ化パスワード"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    invitation_codes {
        bigint id PK "招待コードID"
        bigint inviter_id FK "招待者ID (users.id)"
        string code UK "招待コード"
        boolean used "使用済みフラグ"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    partnerships {
        bigint id PK "パートナーシップID"
        bigint user_id FK "ユーザーID"
        bigint partner_id FK "パートナーのID (users.id)"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    promises {
        bigint id PK "約束ID"
        bigint partnership_id FK "パートナーシップID"
        bigint creator_id FK "作成者ID (users.id)"
        text content "約束の内容"
        string status "ステータス (例: todo, in_progress, done)"
        string type "種類 (例: weekly, one_time)"
        date due_date "期日"
        bigint parent_promise_id FK "親の約束ID (自己参照)"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    promise_evaluations {
        bigint id PK "評価ID"
        bigint promise_id FK "約束ID"
        bigint evaluator_id FK "評価者ID (users.id)"
        integer rating "評価 (例: 1-5)"
        text evaluation_text "評価コメント"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    promise_histories {
        bigint id PK "履歴ID"
        bigint promise_id FK "約束ID"
        string status "変更後のステータス"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    promise_rating_scores {
        bigint id PK "評価スコアID"
        bigint partnership_id FK "パートナーシップID"
        date year_month "対象年月"
        float average_score "月間平均スコア"
        integer harvested_apples "収穫したりんごの数"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    one_words {
        bigint id PK "一言ID"
        bigint partnership_id FK "パートナーシップID"
        bigint sender_id FK "送信者ID (users.id)"
        bigint receiver_id FK "受信者ID (users.id)"
        text content "内容"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

```
## インフラ構成図

<img width="502" height="534" alt="Image" src="https://github.com/user-attachments/assets/63d38c0c-abe2-4082-a8c4-b3432303c88c" />

## 機能一覧
- 会員登録、ログイン/ログアウト
- 約束の作成/削除(内容、期日)
- 約束の一覧表示(自分、パートナー、二人の約束)
- 約束の評価(５段階評価、コメント)
- パートナー招待機能
- 過去の評価された約束の一覧表示(自分、パートナー、二人の約束)
- 評価待ちの約束の一覧表示、通知（自分）
- 1ヶ月の信頼スコアの表示
- メールによる約束評価のリマインド
- メールによる1ヶ月のレポート送信

## 技術的な工夫
- バックエンドをAPIとして、フロントエンドと分離し、S3、CloudFrontを活用したSPA構成にすることでページ遷移の高速化と低コストで運用を実現
- モデルスペックとリクエストスペックでのRSpecテストを実装し、ビジネスロジックとサービス全体の期待動作を保証(ラインカバレッジ90%以上維持) 
- ALBを使いMulti-AZにまたがって配置されたEC2インスタンスに負荷を分散することで単一障害点を排除し、フェイルオーバーを用いることでサービスが停止しにくい可用性の高い構成の実現

## ユーザー目線での工夫
- モーダルを適切に使用することで入力する場所をわかりやすくし、見やすい画面の実現
- 評価をするというセンシティブな内容に踏み入るため、「感謝の言葉を添えよう」と言った文言をフォームに入れることで評価される心理的ストレスの低減
- 信頼スコアの表示やレポートなどといったやったことの可視化によってモチベーションの維持
- 必要最低限の情報量に限定した画面によってユーザーが迷わず分かりやすい画面の実現
