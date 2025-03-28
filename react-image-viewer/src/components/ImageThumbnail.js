import React from 'react';

const ImageThumbnail = ({ image, onClick, thumbnailSize = 150 }) => {
  const thumbnailStyle = {
    width: '100%',
    height: `${thumbnailSize}px`,
    objectFit: 'cover',
    maxWidth: '100%'
  };

  return (
    <div className="image-item" onClick={() => onClick(image)}>
      <img 
        className="image-thumbnail" 
        src={image.path} 
        alt={image.name}
        style={thumbnailStyle}
      />
      <div className="image-name">{image.name}</div>
    </div>
  );
};

export default ImageThumbnail;
