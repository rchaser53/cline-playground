import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './App.css';
import ImageGrid from './components/ImageGrid.js';
import ImageModal from './components/ImageModal.js';
import Sidebar from './components/Sidebar.js';
import SortControls from './components/SortControls.js';
import SizeControls from './components/SizeControls.js';
import PositionControls from './components/PositionControls.js';
import { selectDirectory, getImages, checkDirectoryExists, deleteFile } from './utils/nw.js';

// Enable Node.js integration
if (process.versions['nw-flavor'] === 'sdk') {
  console.log('Running in NW.js SDK mode');
}

function App() {
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isViewingFromSidebar, setIsViewingFromSidebar] = useState(false);
  const [thumbnailSize, setThumbnailSize] = useState(() => {
    // localStorageから前回のサムネイルサイズを取得
    const savedSize = localStorage.getItem('thumbnailSize');
    return savedSize ? parseInt(savedSize, 10) : 150;
  });
  
  const [imagePosition, setImagePosition] = useState(() => {
    // localStorageから前回の画像位置を取得
    return localStorage.getItem('imagePosition') || 'center';
  });
  const [sortConfig, setSortConfig] = useState({
    by: 'name',
    direction: 'asc'
  });

  // ディレクトリ選択処理
  const handleSelectDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await selectDirectory();
      if (!result.canceled) {
        const directoryPath = result.directoryPath;
        setCurrentDirectory(directoryPath);
        
        // 選択されたディレクトリをlocalStorageに保存
        localStorage.setItem('lastOpenedDirectory', directoryPath);
        
        const imageFiles = await getImages(directoryPath);
        setImages(imageFiles);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 前回開いていたディレクトリを読み込む
  useEffect(() => {
    const loadLastDirectory = async () => {
      try {
        const lastDir = localStorage.getItem('lastOpenedDirectory');
        if (lastDir) {
          // ディレクトリが存在するか確認
          const exists = await checkDirectoryExists(lastDir);
          if (exists) {
            setLoading(true);
            setCurrentDirectory(lastDir);
            const imageFiles = await getImages(lastDir);
            setImages(imageFiles);
            setLoading(false);
          } else {
            // ディレクトリが存在しない場合はlocalStorageから削除
            localStorage.removeItem('lastOpenedDirectory');
          }
        }
      } catch (error) {
        console.error('Error loading last directory:', error);
      }
    };

    loadLastDirectory();
  }, []);

  // ソート方法変更
  const handleSortChange = useCallback((sortBy) => {
    setSortConfig(prev => ({ ...prev, by: sortBy }));
  }, []);

  // ソート方向変更
  const handleDirectionChange = useCallback(() => {
    setSortConfig(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // サムネイルサイズ変更
  const handleSizeChange = useCallback((size) => {
    setThumbnailSize(size);
    // サイズをlocalStorageに保存
    localStorage.setItem('thumbnailSize', size.toString());
  }, []);

  // 画像位置変更
  const handlePositionChange = useCallback((position) => {
    setImagePosition(position);
    // 位置をlocalStorageに保存
    localStorage.setItem('imagePosition', position);
  }, []);

  // キーボードショートカット処理
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Command (Meta) キーが押されている場合
      if (event.metaKey) {
        let newPosition;
        let displayText;
        
        switch (event.key) {
          case 't': // Command + T: 上
            newPosition = 'top';
            displayText = '上';
            break;
          case 'c': // Command + C: 中央
            newPosition = 'center';
            displayText = '中央';
            break;
          case 'b': // Command + B: 下
            newPosition = 'bottom';
            displayText = '下';
            break;
          default:
            return;
        }
        
        // 位置を更新
        setImagePosition(newPosition);
        // localStorageに保存
        localStorage.setItem('imagePosition', newPosition);
        // 通知を表示
        showShortcutNotification(displayText);
      }
    };

    // ショートカット通知を表示
    const showShortcutNotification = (position) => {
      const notification = document.createElement('div');
      notification.className = 'shortcut-notification';
      notification.textContent = `画像位置: ${position}`;
      document.body.appendChild(notification);

      // 2秒後に通知を消す
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 1500);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 左右キーでの画像ナビゲーション
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedImage) return;
      
      switch (event.key) {
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        default:
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  // 画像クリック処理
  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
    setIsViewingFromSidebar(false);
  }, []);

  // サイドバーの画像クリック処理
  const handleSidebarImageClick = useCallback((image) => {
    setSelectedImage(image);
    setIsViewingFromSidebar(true);
  }, []);

  // 画像選択処理
  const handleImageSelect = useCallback((image) => {
    setSelectedImages(prevSelected => {
      // 既に選択されている場合は選択解除
      if (prevSelected.some(img => img.path === image.path)) {
        const newSelected = prevSelected.filter(img => img.path !== image.path);
        // 選択画像がなくなった場合はサイドバーを閉じる
        if (newSelected.length === 0) {
          setIsSidebarOpen(false);
        }
        return newSelected;
      }
      // 選択されていない場合で3枚未満なら追加
      else if (prevSelected.length < 3) {
        // 選択画像が追加されたらサイドバーを開く
        setIsSidebarOpen(true);
        return [...prevSelected, image];
      }
      // 既に3枚選択されている場合は変更なし
      return prevSelected;
    });
  }, []);

  // 選択画像を閉じる処理
  const handleCloseSelectedImage = useCallback((image) => {
    setSelectedImages(prevSelected => {
      const newSelected = prevSelected.filter(img => img.path !== image.path);
      // 選択画像がなくなった場合はサイドバーを閉じる
      if (newSelected.length === 0) {
        setIsSidebarOpen(false);
      }
      return newSelected;
    });
  }, []);

  // 画像が選択されているか確認
  const isImageSelected = useCallback((image) => {
    return selectedImages.some(img => img.path === image.path);
  }, [selectedImages]);

  // ソートされた画像
  const sortedImages = useMemo(() => {
    if (images.length === 0) return [];

    return [...images].sort((a, b) => {
      let comparison = 0;
      
      if (sortConfig.by === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortConfig.by === 'lastModified') {
        comparison = a.lastModified - b.lastModified;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [images, sortConfig.by, sortConfig.direction]);

  // モーダルを閉じる
  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // 次の画像に移動
  const handleNextImage = useCallback(() => {
    if (!selectedImage) return;
    
    if (isViewingFromSidebar) {
      // サイドバーから表示している場合は選択された画像間のみで移動
      if (selectedImages.length <= 1) return;
      
      const currentIndex = selectedImages.findIndex(img => img.path === selectedImage.path);
      if (currentIndex === -1) return;
      
      const nextIndex = (currentIndex + 1) % selectedImages.length;
      setSelectedImage(selectedImages[nextIndex]);
    } else {
      // 通常の画像グリッドから表示している場合は全画像間で移動
      if (sortedImages.length <= 1) return;
      
      const currentIndex = sortedImages.findIndex(img => img.path === selectedImage.path);
      if (currentIndex === -1) return;
      
      const nextIndex = (currentIndex + 1) % sortedImages.length;
      setSelectedImage(sortedImages[nextIndex]);
    }
  }, [selectedImage, sortedImages, selectedImages, isViewingFromSidebar]);

  // 前の画像に移動
  const handlePrevImage = useCallback(() => {
    if (!selectedImage) return;
    
    if (isViewingFromSidebar) {
      // サイドバーから表示している場合は選択された画像間のみで移動
      if (selectedImages.length <= 1) return;
      
      const currentIndex = selectedImages.findIndex(img => img.path === selectedImage.path);
      if (currentIndex === -1) return;
      
      const prevIndex = (currentIndex - 1 + selectedImages.length) % selectedImages.length;
      setSelectedImage(selectedImages[prevIndex]);
    } else {
      // 通常の画像グリッドから表示している場合は全画像間で移動
      if (sortedImages.length <= 1) return;
      
      const currentIndex = sortedImages.findIndex(img => img.path === selectedImage.path);
      if (currentIndex === -1) return;
      
      const prevIndex = (currentIndex - 1 + sortedImages.length) % sortedImages.length;
      setSelectedImage(sortedImages[prevIndex]);
    }
  }, [selectedImage, sortedImages, selectedImages, isViewingFromSidebar]);

  // 画像削除処理
  const handleImageDelete = useCallback(async (image) => {
    try {
      const result = await deleteFile(image.path);
      
      if (result.success) {
        // 削除に成功した場合、画像リストから削除
        setImages(prevImages => prevImages.filter(img => img.path !== image.path));
        
        // 削除した画像がモーダルで表示中だった場合、モーダルを閉じる
        if (selectedImage && selectedImage.path === image.path) {
          setSelectedImage(null);
        }
        
        // 削除した画像が選択されていた場合、選択リストからも削除
        setSelectedImages(prevSelected => 
          prevSelected.filter(img => img.path !== image.path)
        );
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }, [selectedImage]);

  return (
    <div className="App">
      <div className={`main-content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
        <header>
          <h1>画像サムネイルビューア</h1>
          <div className="controls">
            <button onClick={handleSelectDirectory}>
              ディレクトリを選択
            </button>
            {images.length > 0 && (
              <div className="control-options">
                <SortControls 
                  sortConfig={sortConfig}
                  onSortChange={handleSortChange}
                  onDirectionChange={handleDirectionChange}
                />
                <SizeControls
                  thumbnailSize={thumbnailSize}
                  onSizeChange={handleSizeChange}
                />
                <PositionControls
                  position={imagePosition}
                  onPositionChange={handlePositionChange}
                />
              </div>
            )}
          </div>
          {currentDirectory && (
            <div id="current-directory">
              選択されたディレクトリ: {currentDirectory}
            </div>
          )}
          <div className="keyboard-shortcuts-help">
            ショートカット: ⌘+T (上) / ⌘+C (中央) / ⌘+B (下)
          </div>
        </header>

        <main>
          {loading ? (
            <div id="loading">
              <p>読み込み中...</p>
            </div>
          ) : (
            <ImageGrid 
              images={sortedImages} 
              onImageClick={handleImageClick}
              onImageDelete={handleImageDelete}
              onImageSelect={handleImageSelect}
              isImageSelected={isImageSelected}
              thumbnailSize={thumbnailSize}
              imagePosition={imagePosition}
            />
          )}
        </main>

        {selectedImage && (
          <ImageModal 
            image={selectedImage} 
            onClose={handleCloseModal}
            onNext={handleNextImage}
            onPrev={handlePrevImage}
            onDelete={handleImageDelete}
          />
        )}
      </div>

      <Sidebar 
        selectedImages={selectedImages}
        onCloseImage={handleCloseSelectedImage}
        onImageClick={handleSidebarImageClick}
        isOpen={isSidebarOpen}
      />
    </div>
  );
}

export default App;
