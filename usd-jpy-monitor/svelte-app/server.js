import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// 静的ファイルを提供
app.use(express.static(join(__dirname, 'public')));

// 為替レートAPIのプロキシエンドポイント
app.get('/api/exchange-rate', async (req, res) => {
  try {
    // キャッシュを防止するためにタイムスタンプパラメータを追加
    const timestamp = new Date().getTime();
    const url = `https://open.er-api.com/v6/latest/USD?_=${timestamp}`;
    
    // キャッシュを無効化するヘッダーを設定
    const options = {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    // クライアントにデータを返す
    res.json(data);
  } catch (error) {
    console.error('為替レートの取得に失敗しました:', error);
    res.status(500).json({ error: '為替レートの取得に失敗しました' });
  }
});

// すべてのリクエストをindex.htmlにリダイレクト（SPA対応）
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
