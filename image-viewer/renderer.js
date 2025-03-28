const { ipcRenderer } = require('electron');
const path = require('path');

// DOM要素
const selectDirectoryButton = document.getElementById('select-directory');
const currentDirectoryElement = document.getElementById('current-directory');
const imageContainer = document.getElementById('image-container');
const noImagesElement = document.getElementById('no-images');
const loadingElement = document.getElementById('loading');
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalImageName = document.getElementById('modal-image-name');
const closeButton = document.querySelector('.close-button');
const sortBySelect = document.getElementById('sort-by');
const sortDirectionButton = document.getElementById('sort-direction');
const sortIcon = document.getElementById('sort-icon');

// 現在のディレクトリパス
let currentDirectoryPath = '';
// 現在の画像リスト
let currentImages = [];
// ソート設定
let sortConfig = {
  by: 'name', // 'name' または 'lastModified'
  direction: 'asc' // 'asc' または 'desc'
};

// ディレクトリ選択ボタンのクリックイベント
selectDirectoryButton.addEventListener('click', async () => {
  try {
    // ローディング表示
    showLoading(true);
    
    // ディレクトリ選択ダイアログを開く
    const result = await ipcRenderer.invoke('select-directory');
    
    if (!result.canceled) {
      currentDirectoryPath = result.directoryPath;
      currentDirectoryElement.textContent = `選択されたディレクトリ: ${currentDirectoryPath}`;
      
      // 画像を読み込む
      await loadImages(currentDirectoryPath);
    }
    
    // ローディング非表示
    showLoading(false);
  } catch (error) {
    console.error('Error selecting directory:', error);
    showLoading(false);
  }
});

// 画像の読み込み
async function loadImages(directoryPath) {
  try {
    // 画像コンテナをクリア
    imageContainer.innerHTML = '';
    
    // 画像ファイルを取得
    const images = await ipcRenderer.invoke('get-images', directoryPath);
    currentImages = images;
    
    if (images.length === 0) {
      // 画像がない場合
      noImagesElement.classList.remove('hidden');
      imageContainer.classList.add('hidden');
    } else {
      // 画像がある場合
      noImagesElement.classList.add('hidden');
      imageContainer.classList.remove('hidden');
      
      // 画像をソートして表示
      displaySortedImages();
    }
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

// ソートされた画像を表示
function displaySortedImages() {
  // 画像コンテナをクリア
  imageContainer.innerHTML = '';
  
  // 画像をソート
  const sortedImages = sortImages(currentImages, sortConfig.by, sortConfig.direction);
  
  // 画像を表示
  sortedImages.forEach(image => {
    const imageItem = createImageElement(image);
    imageContainer.appendChild(imageItem);
  });
}

// 画像をソート
function sortImages(images, sortBy, direction) {
  return [...images].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'lastModified') {
      comparison = a.lastModified - b.lastModified;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
}

// 画像要素の作成
function createImageElement(image) {
  const imageItem = document.createElement('div');
  imageItem.className = 'image-item';
  
  const img = document.createElement('img');
  img.className = 'image-thumbnail';
  img.src = `file://${image.path}`;
  img.alt = image.name;
  
  const imageName = document.createElement('div');
  imageName.className = 'image-name';
  imageName.textContent = image.name;
  
  imageItem.appendChild(img);
  imageItem.appendChild(imageName);
  
  // クリックイベント（画像拡大表示）
  imageItem.addEventListener('click', () => {
    openImageModal(image);
  });
  
  return imageItem;
}

// 画像モーダルを開く
function openImageModal(image) {
  modalImage.src = `file://${image.path}`;
  modalImage.alt = image.name;
  modalImageName.textContent = image.name;
  imageModal.classList.remove('hidden');
}

// 画像モーダルを閉じる
function closeImageModal() {
  imageModal.classList.add('hidden');
  // モーダルが完全に閉じた後に画像をクリア
  setTimeout(() => {
    modalImage.src = '';
    modalImage.alt = '';
  }, 300); // トランジションの時間と合わせる
}

// モーダルの閉じるボタンのクリックイベント
closeButton.addEventListener('click', closeImageModal);

// モーダルの背景クリックで閉じる
imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
    closeImageModal();
  }
});

// ローディング表示の切り替え
function showLoading(show) {
  if (show) {
    loadingElement.classList.remove('hidden');
  } else {
    loadingElement.classList.add('hidden');
  }
}

// ソート方向を切り替え
function toggleSortDirection() {
  sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  sortIcon.textContent = sortConfig.direction === 'asc' ? '↓' : '↑';
  
  if (currentImages.length > 0) {
    displaySortedImages();
  }
}

// ソート方法を変更
function changeSortBy(sortBy) {
  sortConfig.by = sortBy;
  
  if (currentImages.length > 0) {
    displaySortedImages();
  }
}

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  // モーダルが確実に非表示になっていることを確認
  imageModal.classList.add('hidden');
  modalImage.src = '';
  modalImage.alt = '';
  
  // ソート方向ボタンのイベントリスナー
  sortDirectionButton.addEventListener('click', toggleSortDirection);
  
  // ソート方法セレクトのイベントリスナー
  sortBySelect.addEventListener('change', (e) => {
    changeSortBy(e.target.value);
  });
});
