import React from 'react';

const ImageThumbnail = ({ image, onClick, thumbnailSize = 150, imagePosition = 'center' }) => {
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
