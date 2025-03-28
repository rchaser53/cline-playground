import React, { useEffect } from 'react';

const ImageModal = ({ image, onClose }) => {
  useEffect(() => {
    // ESCキーでモーダルを閉じる
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <img 
          id="modal-image" 
          src={image.path} 
          alt={image.name} 
        />
        <div id="modal-image-name">{image.name}</div>
      </div>
    </div>
  );
};

export default ImageModal;
