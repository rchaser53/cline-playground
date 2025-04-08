import React, { useState, useRef, useEffect } from 'react';

const Sidebar = ({ selectedImages, onCloseImage, isOpen }) => {
  const [width, setWidth] = useState(300); // デフォルトの幅
  const sidebarRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // リサイズハンドルのドラッグ開始
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // リサイズハンドルのドラッグ中
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.max(200, Math.min(600, startWidthRef.current + deltaX));
    setWidth(newWidth);
  };

  // リサイズハンドルのドラッグ終了
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // コンポーネントのアンマウント時にイベントリスナーを削除
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="sidebar" ref={sidebarRef} style={{ width: `${width}px` }}>
      <div 
        className="resize-handle" 
        ref={resizeHandleRef}
        onMouseDown={handleMouseDown}
      ></div>
      <div className="sidebar-content">
        <h3>選択された画像 ({selectedImages.length}/3)</h3>
        <div className="selected-images-list">
          {selectedImages.map(image => (
            <div key={image.path} className="selected-image-item">
              <img 
                src={image.path} 
                alt={image.name} 
                className="selected-image"
              />
              <div className="selected-image-name">{image.name}</div>
              <button 
                className="close-selected-image" 
                onClick={() => onCloseImage(image)}
                title="選択解除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
