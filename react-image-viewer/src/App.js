import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import SortControls from './components/SortControls';
import SizeControls from './components/SizeControls';
import PositionControls from './components/PositionControls';
import { selectDirectory, getImages } from './utils/electron';

function App() {
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [thumbnailSize, setThumbnailSize] = useState(150);
  const [imagePosition, setImagePosition] = useState('center');
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
        setCurrentDirectory(result.directoryPath);
        const imageFiles = await getImages(result.directoryPath);
        setImages(imageFiles);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    } finally {
      setLoading(false);
    }
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
  }, []);

  // 画像位置変更
  const handlePositionChange = useCallback((position) => {
    setImagePosition(position);
  }, []);

  // 画像クリック処理
  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);

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
    if (!selectedImage || sortedImages.length <= 1) return;
    
    const currentIndex = sortedImages.findIndex(img => img.path === selectedImage.path);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % sortedImages.length;
    setSelectedImage(sortedImages[nextIndex]);
  }, [selectedImage, sortedImages]);

  // 前の画像に移動
  const handlePrevImage = useCallback(() => {
    if (!selectedImage || sortedImages.length <= 1) return;
    
    const currentIndex = sortedImages.findIndex(img => img.path === selectedImage.path);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + sortedImages.length) % sortedImages.length;
    setSelectedImage(sortedImages[prevIndex]);
  }, [selectedImage, sortedImages]);

  return (
    <div className="App">
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
        />
      )}
    </div>
  );
}

export default App;
