import React from 'react';
import ImageThumbnail from './ImageThumbnail';

const ImageGrid = ({ images, onImageClick }) => {
  if (images.length === 0) {
    return (
      <div id="no-images">
        <p>選択されたディレクトリに画像がありません。</p>
      </div>
    );
  }

  return (
    <div className="image-grid">
      {images.map((image, index) => (
        <ImageThumbnail 
          key={`${image.path}-${index}`} 
          image={image} 
          onClick={onImageClick} 
        />
      ))}
    </div>
  );
};

export default ImageGrid;
