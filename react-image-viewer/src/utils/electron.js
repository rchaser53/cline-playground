// Electron IPCRenderer APIを使用するためのユーティリティ
let ipcRenderer;

// Electronの環境かどうかをチェック
try {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
} catch (error) {
  console.warn('Electron IPC not available. Running in browser mode.');
  
  // ブラウザモード用のモックデータ
  ipcRenderer = {
    invoke: async (channel, ...args) => {
      console.log(`IPC invoke: ${channel}`, args);
      if (channel === 'select-directory') {
        return { canceled: false, directoryPath: '/mock/directory' };
      }
      if (channel === 'get-images') {
        return [
          { name: 'mock-image-1.jpg', path: 'file:///mock/directory/mock-image-1.jpg', lastModified: Date.now(), lastModifiedDate: new Date().toISOString() },
          { name: 'mock-image-2.png', path: 'file:///mock/directory/mock-image-2.png', lastModified: Date.now() - 86400000, lastModifiedDate: new Date(Date.now() - 86400000).toISOString() }
        ];
      }
      return null;
    }
  };
}

// ディレクトリ選択ダイアログを開く
export const selectDirectory = async () => {
  try {
    return await ipcRenderer.invoke('select-directory');
  } catch (error) {
    console.error('Error selecting directory:', error);
    return { canceled: true };
  }
};

// ディレクトリ内の画像を取得
export const getImages = async (directoryPath) => {
  try {
    return await ipcRenderer.invoke('get-images', directoryPath);
  } catch (error) {
    console.error('Error getting images:', error);
    return [];
  }
};
