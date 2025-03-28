const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const url = require('url');

// メインウィンドウの参照をグローバルに保持
let mainWindow;

function createWindow() {
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false // ローカルファイルのロードを許可
    }
  });

  // 開発モードの場合はローカルサーバーから読み込み、本番モードの場合はビルドされたファイルを読み込む
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
      });
  
  mainWindow.loadURL(startUrl);

  // 開発ツールを開く（開発時のみ）
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Electronの初期化が完了したらウィンドウを作成
app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられたときの処理
app.on('window-all-closed', function () {
  // macOSでは、ユーザーがCmd + Qで明示的に終了するまで
  // アプリケーションとそのメニューバーは有効なままにするのが一般的
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // macOSでは、ドックアイコンをクリックしたときに
  // ウィンドウがない場合は新しいウィンドウを作成するのが一般的
  if (mainWindow === null) createWindow();
});

// ディレクトリ選択ダイアログを開く
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { 
    canceled: false, 
    directoryPath: result.filePaths[0] 
  };
});

// ディレクトリ内の画像ファイルを取得
ipcMain.handle('get-images', async (event, directoryPath) => {
  try {
    const files = fs.readdirSync(directoryPath);
    
    // 画像ファイルのみをフィルタリング
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.avif'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // 画像ファイルのパスと情報を返す
    return imageFiles.map(file => {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: `file://${filePath}`,
        lastModified: stats.mtime.getTime(),
        lastModifiedDate: stats.mtime.toISOString()
      };
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});
