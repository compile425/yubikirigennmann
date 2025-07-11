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
    subgraph "システム (定時バッチ/トリガー)"
        T1("開始: 週次 or 約束の期限到来") --> T2["評価者に<br>リマインド通知を送信"]
    end

    subgraph "評価者 (約束された側)"
        T2 --> U1["通知から評価画面へ"]
        U1 --> U2["星評価(1~5)を選択"]
        U2 --> D1{"星2以下か？"}
        D1 -- No --> U4["「思ったこと(感謝など)」<br>を記入"]
        D1 -- Yes --> U3["「改善案」を記入"] --> U4
        U4 --> U5["評価を送信"]
    end

    subgraph "システム (APIサーバー)"
        U5 --> S1["[DB] 評価データを保存"] --> S2["[DB] 約束ステータスを更新"] --> S3["[DB] 信頼スコアを<br>再計算・更新"]
        S3 --> S4["りんごの木のアニメーションを<br>再生させる(実る)"]
        S3 -.-> S5["(非同期) 被評価者へ<br>評価完了を通知"]
        S4 --> C1("完了")
    end

    subgraph "被評価者 (約束した側)"
        S5 -.-> E1["評価完了の通知を受け取り、<br>内容を確認"]
    end

    style T1 fill:#B9E6FF,color:#000
    style C1 fill:#B9E6FF,color:#000
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
### フロー6：「想いを伝える」フォーム

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
# テーブル定義書（もしくは ER 図）
erDiagram
    users ||--o{ partnerships : "has one"
    partnerships ||--|{ promises : "has many"
    partnerships ||--|{ notes : "has many"
    users ||--o{ promises : "creates"
    users ||--o{ evaluations : "evaluates"
    users ||--o{ notes : "sends"
    promises ||--|{ evaluations : "has many"

    users {
        int id "PK"
        string email
        string password_digest
        string name
        string profile_image_url
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
        string title
        text description
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
# システム構成図
作成中です

