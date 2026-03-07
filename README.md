# 水処理特許マッピングシステム

水処理プロセスのフロー図上に特許情報をマッピングして可視化するWebアプリケーション。

## Vercelへのデプロイ手順

### 前提条件
- GitHubアカウント
- Vercelアカウント（GitHubで無料登録可能: https://vercel.com）

### 手順

#### 1. GitHubリポジトリを作成

```bash
cd water-patent-app
git init
git add .
git commit -m "Initial commit: Water Patent Mapping App"
```

GitHubで新しいリポジトリを作成し、プッシュ:

```bash
git remote add origin https://github.com/あなたのユーザー名/water-patent-app.git
git branch -M main
git push -u origin main
```

#### 2. Vercelと連携

1. https://vercel.com にアクセスしてGitHubアカウントでログイン
2. 「Add New...」→「Project」をクリック
3. 先ほど作成したリポジトリ `water-patent-app` を選択
4. Framework Preset: **Vite** が自動検出される
5. 「Deploy」ボタンをクリック

以上で完了です。数十秒でデプロイされ、`https://water-patent-app.vercel.app` のようなURLが発行されます。

#### 3. 以降の更新

`main` ブランチにプッシュするたびにVercelが自動的に再デプロイします。

```bash
git add .
git commit -m "Update: 説明"
git push
```

## ローカル開発

```bash
npm install
npm run dev     # 開発サーバー起動 → http://localhost:5173
npm run build   # 本番ビルド → dist/
npm run preview # ビルド結果のプレビュー
```

## 技術スタック

- React 18 + Vite
- Tailwind CSS
- Recharts（グラフ）
- Lucide React（アイコン）
