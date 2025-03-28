import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import SortControls from './components/SortControls';
import { selectDirectory, getImages } from './utils/electron';

function App() {
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

  // 画像クリック処理
  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  // モーダルを閉じる
  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
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

  return (
    <div className="App">
      <header>
        <h1>画像サムネイルビューア</h1>
        <div className="controls">
          <button onClick={handleSelectDirectory}>
            ディレクトリを選択
          </button>
          {images.length > 0 && (
            <SortControls 
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
              onDirectionChange={handleDirectionChange}
            />
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
          />
        )}
      </main>

      {selectedImage && (
        <ImageModal 
          image={selectedImage} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}

export default App;
