# ToDoList

Supabase を使ったシンプルな ToDo 管理アプリです。`web/` 配下にフロントエンドの実装があり、ログイン後にタスクの追加、完了、削除ができます。

## 主な機能

- メールアドレスとパスワードによるログイン
- 今日、明日、重要、通常のタブ切り替え
- タスクの追加
- タスクの完了状態の更新
- タスクの削除

## 技術スタック

- HTML
- CSS
- JavaScript
- Supabase

## ディレクトリ構成

```text
.
├─ docs/
├─ mobile/
├─ shared/
└─ web/
   ├─ app.js
   ├─ index.html
   ├─ login.html
   ├─ login.js
   ├─ style.css
   └─ supabase-client.js
```

## ローカルでの確認

1. `web/supabase-client.js` に設定されている Supabase プロジェクトを利用できる状態にします。
2. 静的ファイルを配信できるローカルサーバーで `web/` を公開します。
3. `login.html` を開いてログインし、各タブでタスク操作を確認します。

例:

```bash
npx serve web
```

## 補足

- `docs/` `mobile/` `shared/` は現在このリポジトリ内にありますが、この README では `web/` 実装を中心に説明しています。
