# ドル円為替相場モニター (Svelte版)

USD/JPY為替レートをリアルタイムで監視し、急激な変動を検知するアプリケーションです。

## 機能

- リアルタイムでの為替レート表示
- 急変アラート機能（閾値を超える変動があった場合に通知）
- カスタマイズ可能な設定（変動閾値、更新間隔）
- レート履歴のグラフ表示
- 詳細な履歴テーブル
- アラート履歴の保存と表示

## 技術スタック

- [Svelte](https://svelte.dev/) - 高効率なUIフレームワーク
- [Chart.js](https://www.chartjs.org/) - グラフ描画ライブラリ
- [Express](https://expressjs.com/) - Webサーバー

## インストールと実行方法

### 必要条件

- Node.js (v12以上)
- npm (v6以上)

### インストール

```bash
# 依存関係のインストール
npm install
```

### ビルド

```bash
# アプリケーションのビルド
npm run build
```

### 実行

```bash
# サーバーの起動
node server.js
```

ブラウザで http://localhost:3000 にアクセスしてアプリケーションを使用できます。

## 使い方

1. アプリケーションを起動すると、現在のUSD/JPYレートが表示されます
2. 「変動閾値」と「更新間隔」を設定します
3. 「モニタリング開始」ボタンをクリックして監視を開始します
4. 設定した閾値を超える変動があった場合、アラートが表示されます
5. 「モニタリング停止」ボタンをクリックして監視を停止できます

## ライセンス

MIT
