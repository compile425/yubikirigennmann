# 画面遷移図

<img width="1029" height="425" alt="Image" src="https://github.com/user-attachments/assets/47b2cd26-0525-43af-a78b-5211373636a9" />

# 業務フロー

### フロー1：新規ユーザー登録 〜 パートナー招待

* **概要：** 新規ユーザー（ユーザーA）が登録し、パートナー（ユーザーB）を招待して、二人のアカウントがアプリ上で紐づくまでの流れです。

```mermaid
graph TD
    subgraph ユーザーA
        A1("開始: アプリ利用") --> A2["情報を入力し、新規登録"]
        A2 --> S1
        S3 --> A3["ダッシュボード表示"] --> A4["パートナーを招待"]
        A4 --> S5
        S6 --> A5["招待リンクをコピーし、<br>LINE等でパートナーに送信"]
    end

    subgraph システム
        S1["[DB] ユーザーA情報を保存<br>(パートナーIDは未設定)"] --> S2["認証トークン(JWT)を発行"] --> S3["Cookieに保存し、ログインさせる"]
        S5["有効期限付きの<br>招待リンクを生成"] --> S6["リンクを画面に表示"]
        B2 --> S7["招待リンクの有効性を検証"]
        S7 -- OK --> S8["[DB] ユーザーB情報を保存"] --> S9["[DB] ユーザーAとBの<br>パートナーIDを相互に紐付ける"] --> S10["使用済み招待リンクを無効化"] --> S11["ユーザーBをログインさせ<br>ダッシュボードへ案内"]
        S9 -.-> S12["(非同期) ユーザーAへ<br>パートナー成立を通知"]
    end

    subgraph ユーザーB
        A5 -.-> B1["受け取った招待リンクを開く"] --> B2["情報を入力し、新規登録"]
        S11 --> B3("完了: パートナーとして<br>利用開始")
    end

    style A1 fill:#B9E6FF,color:#000
    style B3 fill:#B9E6FF,color:#000

```
### フロー2：約束の登録から 〜 誓約

* **概要：** 新しい約束を登録し、「誓約書」にサインすることで、二人の間で約束が共有される流れです。
```mermaid
graph TD
    subgraph "約束する人"
        A1("開始: 新しい約束を作成") --> A2["約束の内容・期限を入力"]
        A2 --> S1
    end

    subgraph "システム"
        S1["[DB] 約束データを保存<br>(ステータス: 進行中)"] --> S2["(リアルタイム) パートナーの画面に<br>新しい約束を即時表示"]
        S1 -.-> S3["(非同期) パートナーへ<br>新規約束を通知"]
        S2 --> C1("完了")
    end

    subgraph "パートナー"
        S3 -.-> P1["通知を受け取り、<br>内容を確認"]
    end

    style A1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
```
### フロー3：約束の評価

* **概要：** システムからの通知をきっかけに、約束された側（評価者）が約束を評価し、その結果が相手（被評価者）に伝わるまでの流れです。
```mermaid

graph TD
    subgraph "システム (定時バッチ)"
        T1("開始: 週次 or 約束の期限到来") --> T2 ["評価者に<br>リマインド通知を送信"]
    end

    subgraph "評価者 (約束された側)"
        T2 --> U1 ["通知から評価画面へ"]
        U1 --> U2 ["星評価(1~5)と<br>「思ったこと(感謝など)」を記入"]
        U2 --> U5 ["評価を送信"]
    end

    subgraph "システム (APIサーバー)"
        U5 --> S1 ["[DB] 評価データを保存"]
        S1 --> S2 ["[DB] 約束ステータスを更新"]
        S2 --> S3 ["[DB] 信頼スコアを<br>再計算・更新"]
        S3 --> S4 ["りんごの木のアニメーションを<br>再生させる(実る)"]
        S4 --> D1 {"評価が星2以下か？"}
        D1 -- No --> C1("完了")
        D1 -- Yes --> S5 ["(非同期) 被評価者へ<br>改善案の入力を要求"]
    end

    subgraph "被評価者 (約束した側)"
        S5 -.-> E1 ["改善案の要求通知を受け取る"]
        E1 --> E2 ["評価内容を確認し、<br>改善案を記入・送信"]
        E2 --> E3 ["[システム] 改善案をDBに保存"]
        E3 --> E4("完了")
    end

    style T1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
    style E4 fill:#B9E6FF,color:#000
```
### フロー4：月末の月次レポート

* **概要：** ユーザーの操作を介さず、月末にシステムが自動でその月の活動を集計し、レポートとしてユーザーにフィードバックする流れです。
```mermaid
graph TD
    subgraph "システム (定時バッチ)"
        B1("開始: 月末の深夜") --> B2["[DB] 今月の評価データを集計"]
        B2 --> B3["平均信頼スコアを算出"]
        B2 --> B4["収穫するりんごの総数を計算"]
        B3 & B4 --> B5["月次レポートメールを作成し、<br>両ユーザーに送信"]
        B5 --> B6["[DB] りんごの木の<br>状態をリセット（収穫）"]
        B6 --> C1("完了")
    end

    subgraph "両方のユーザー"
        B5 -.-> U1["月次レポートメールを<br>受け取る"]
    end

    style B1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
```
### フロー5：約束の編集・削除

* **概要：** 一度作成した約束の内容を変更したり、取り消したりする際の基本的な操作フローです。
```mermaid

graph TD
    subgraph "操作ユーザー"
        A1("開始: 約束一覧画面") --> A2{"編集 or 削除？"}
        A2 -- 編集 --> A3["編集したい約束を選択"] --> A4["内容を修正し、保存ボタンを押す"]
        A2 -- 削除 --> B1["削除したい約束を選択"] --> B2["「本当に削除しますか？」<br>確認ダイアログ表示"] --> B3["「はい」を選択"]
        A4 --> S1
        B3 --> S3
    end

    subgraph "システム"
        S1["[DB] 約束データを更新"] --> S2["(非同期) パートナーへ<br>「約束が更新されました」と通知"]
        S3["[DB] 約束データを削除<br>(論理削除 or 物理削除)"] --> S4["(非同期) パートナーへ<br>「約束が削除されました」と通知"]
        S2 --> C1("完了")
        S4 --> C1
    end

    subgraph "パートナー"
        S2 -.-> P1["通知を受け取り、<br>更新内容を確認"]
        S4 -.-> P2["通知を受け取り、<br>約束が消えたことを確認"]
    end

    style A1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
```
### フロー6：「ちょっと一言」フォーム

* **概要：** 約束の評価とは別に、日々の感謝や言えなかった想いを伝える、もう一つのコミュニケーション機能のフローです。
```mermaid
graph TD
    subgraph "送信者"
        A1("開始: 専用フォームを開く") --> A2["伝えたい想いを<br>メッセージとして入力"] --> A3["送信ボタンを押す"]
        A3 --> S1
    end

    subgraph "システム"
        S1["[DB] メッセージデータを保存"] --> S2["(非同期) 受信者へ<br>「〇〇さんから想いが届いています」<br>と通知"]
        S2 --> C1("完了")
        R2 --> S3["[DB] メッセージを<br>「既読」に更新"]
    end

    subgraph "受信者 (パートナー)"
        S2 -.-> R1["通知をタップし、<br>メッセージ画面へ"] --> R2["メッセージを読む"]
    end
    
    style A1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
```
### フロー7：パートナー関係の解消

* **概要：** イレギュラーケースの中で二人のデータがどう扱われるかを明確にするためのフローです。
```mermaid
graph TD
    subgraph "申請ユーザー"
        A1("開始: 設定画面から<br>「パートナー関係を解消」を選択") --> A2["最終確認ダイアログ<br>「全てのデータが閲覧不可になります」<br>などを表示"]
        A2 --> A3["同意して実行"]
        A3 --> S1
    end

    subgraph "システム"
        S1["[DB] 両ユーザーのレコードから<br>パートナーIDの紐付けを解除"] --> S2["[DB] 二人に関連する約束や評価データを<br>ポリシーに基づき処理 (例: 論理削除)"]
        S2 -.-> S3["(非同期) パートナーへ<br>「〇〇さんとの関係が解消されました」<br>と通知"]
        S3 --> C1("完了")
    end

    subgraph "パートナー"
        S3 -.-> P1["通知を受け取る<br>ログインはできるが、<br>過去のデータは閲覧不可になる"]
    end

    style A1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
```
# ワイヤーフレーム
[ゆびきりげんまん.pdf](https://github.com/user-attachments/files/21178378/default.pdf)
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/35fbabbd-78be-4b2a-ace9-5e6b115059d2" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/bcead0be-f42f-4dac-a1c3-6477cf882932" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/8040c8e2-8b02-4078-93ae-a7a5ca87f128" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/51e2d4b5-aa56-4088-bdc8-64976896b698" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/dc4003ab-d2e2-41a9-abff-e16751323267" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/8a09610e-e601-4f5b-ac4a-e6964376f237" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/71a58293-75a6-4cdf-b36a-767fbaed4b5c" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/fe643607-ed89-4562-97b4-86a6ed4da1a8" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/3c2c37db-a10a-46dd-bd9c-2ad720743edf" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/09f7d637-ea76-495a-b103-82fe15dfdfd7" />
<img width="1728" height="1117" alt="Image" src="https://github.com/user-attachments/assets/1e7a1270-2d40-485d-a01a-19aeef90e475" />
# ER 図

```mermaid
erDiagram
    %% --- 関係性の定義 ---
    partnerships ||--|{ users : "has"
    partnerships ||--|{ promises : "has many"
    partnerships ||--|{ notes : "has many"
    users ||--o{ promises : "creates"
    users ||--o{ evaluations : "evaluates"
    users ||--o{ notes : "sends"
    promises ||--|{ evaluations : "has many"

    %% --- テーブル（エンティティ）の定義 ---
    users {
        int id "PK"
        string email
        string password_digest
        string name
        string profile_image_url
        int partnership_id "FK"
    }

    partnerships {
        int id "PK"
        string invite_token
        string status
    }

    promises {
        int id "PK"
        int partnership_id "FK"
        int creator_id "FK"
        text content
        string promise_type
        date due_date
        string status
    }

    evaluations {
        int id "PK"
        int promise_id "FK"
        int evaluator_id "FK"
        int score
        text comment
        text improvement_plan
    }

    notes {
        int id "PK"
        int partnership_id "FK"
        int sender_id "FK"
        text content
        boolean is_read
    }
```
# システム構成図(アプリケーションレイヤーのみ)
```mermaid
graph TD
    subgraph "フロントエンド (React)"
        F_Router["Router<br>(画面のURL管理)"] --> F_Components["UIコンポーネント<br>(ボタン、フォーム、画面表示)"]
        F_Components -- "操作" --> F_State["State管理<br>(状態保持)"]
        F_State -- "API呼び出し" --> F_API["APIクライアント<br>(データ送受信)"]
        F_API -- "状態更新" --> F_State
        F_State -- "再描画" --> F_Components
    end

    subgraph "バックエンド (Rails API)"
        B_Router["Router (routes.rb)<br>(リクエストの入口)"] --> B_Controllers["コントローラー<br>(リクエストの受付・指示)"]
        B_Controllers --> B_Services["サービスオブジェクト<br>(複雑なビジネスロジック)"]
        B_Controllers --> B_Models["モデル<br>(データ処理・検証)"]
        B_Services --> B_Models
        B_Models --> B_Serializers["シリアライザー<br>(JSON整形)"]
        B_Controllers --> B_Serializers
        B_Controllers -.-> B_Jobs["バックグラウンドジョブ<br>(メール送信、リマインド)"]
    end

    %% フロントエンドとバックエンドの連携
    F_API -- "HTTPリクエスト / JSONレスポンス" --> B_Router
```
