import React from 'react';
import ImageThumbnail from './ImageThumbnail.js';

const ImageGrid = ({ 
  images, 
  onImageClick, 
  onImageDelete, 
  onImageSelect,
  isImageSelected,
  thumbnailSize, 
  imagePosition 
}) => {
  if (images.length === 0) {
    return (
      <div id="no-images">
        <p>選択されたディレクトリに画像がありません。</p>
      </div>
    );
  }

  // Add data-size attribute for larger thumbnails
  const gridSize = thumbnailSize >= 400 ? "large" : "normal";
  
  return (
    <div className="image-grid-container">
      <div className="image-grid" data-size={gridSize}>
        {images.map((image, index) => (
          <ImageThumbnail 
            key={`${image.path}-${index}`} 
            image={image} 
            onClick={onImageClick}
            onDelete={onImageDelete}
            onSelect={() => onImageSelect(image)}
            isSelected={isImageSelected(image)}
            thumbnailSize={thumbnailSize}
            imagePosition={imagePosition}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
