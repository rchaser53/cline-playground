import React from 'react';

const ImageThumbnail = ({ 
  image, 
  onClick, 
  onDelete, 
  onSelect,
  isSelected,
  thumbnailSize = 150, 
  imagePosition = 'center' 
}) => {
  const thumbnailStyle = {
    width: '100%',
    height: `${thumbnailSize}px`,
    objectFit: 'cover',
    objectPosition: `center ${imagePosition}`,
    maxWidth: '100%'
  };
  
  // Adjust object-position based on the selected position
  if (imagePosition === 'top') {
    thumbnailStyle.objectPosition = 'center top';
  } else if (imagePosition === 'center') {
    thumbnailStyle.objectPosition = 'center center';
  } else if (imagePosition === 'bottom') {
    thumbnailStyle.objectPosition = 'center bottom';
  }

  // 削除ボタンのクリックイベントが親要素に伝播しないようにする
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(image);
    }
  };

  // 選択ボタンのクリックイベントが親要素に伝播しないようにする
  const handleSelectClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(image);
    }
  };

  return (
    <div className={`image-item ${isSelected ? 'selected' : ''}`}>
      <div className="thumbnail-container" onClick={() => onClick(image)}>
        <img 
          className="image-thumbnail" 
          src={image.path} 
          alt={image.name}
          style={thumbnailStyle}
        />
        <div className="image-name">{image.name}</div>
      </div>
      <button 
        className="delete-button" 
        onClick={handleDeleteClick}
        title="削除"
      >
        ×
      </button>
      <button 
        className="select-button" 
        onClick={handleSelectClick}
        title={isSelected ? "選択解除" : "選択"}
      >
        {isSelected ? '✓' : '□'}
      </button>
    </div>
  );
};

export default ImageThumbnail;
