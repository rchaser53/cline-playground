import React, { useEffect } from 'react';

const ImageModal = ({ image, onClose, onNext, onPrev, onDelete }) => {
  useEffect(() => {
    // キーボードイベントの処理
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          onNext && onNext();
          break;
        case 'ArrowLeft':
          onPrev && onPrev();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  if (!image) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        
        {onPrev && (
          <button className="nav-button prev-button" onClick={onPrev}>
            &lt;
          </button>
        )}
        
        {onNext && (
          <button className="nav-button next-button" onClick={onNext}>
            &gt;
          </button>
        )}
        
        <img 
          id="modal-image" 
          src={image.path} 
          alt={image.name} 
        />
        <div id="modal-image-name">{image.name}</div>
        
        <div className="modal-actions">
          {onDelete && (
            <button 
              className="modal-delete-button" 
              onClick={() => {
                onDelete(image);
                onClose();
              }}
              title="削除"
            >
              削除
            </button>
          )}
        </div>
        
        <div className="keyboard-hint">
          ← → キーで画像を切り替え
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
