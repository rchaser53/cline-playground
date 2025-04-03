const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { unlink } = require('fs/promises');
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

// ディレクトリが存在するかチェック
ipcMain.handle('check-directory-exists', async (event, directoryPath) => {
  try {
    if (!directoryPath) return false;
    
    const stats = fs.statSync(directoryPath);
    return stats.isDirectory();
  } catch (error) {
    // ディレクトリが存在しない場合やアクセス権限がない場合はfalseを返す
    return false;
  }
});

// ファイル削除処理
ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    // file:// プロトコルを削除
    if (filePath.startsWith('file://')) {
      filePath = filePath.substring(7);
    }
    
    // 削除前に確認ダイアログを表示
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'ファイル削除の確認',
      message: '本当にこのファイルを削除しますか？',
      detail: `ファイル: ${path.basename(filePath)}`,
      buttons: ['キャンセル', '削除'],
      defaultId: 0,
      cancelId: 0
    });
    
    // キャンセルが選択された場合
    if (result.response === 0) {
      return { success: false, canceled: true };
    }
    
    // ファイルを削除
    await unlink(filePath);
    return { success: true, filePath };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
});
