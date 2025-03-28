import React from 'react';

const ImageThumbnail = ({ image, onClick }) => {
  return (
    <div className="image-item" onClick={() => onClick(image)}>
      <img 
        className="image-thumbnail" 
        src={image.path} 
        alt={image.name} 
      />
      <div className="image-name">{image.name}</div>
    </div>
  );
};

export default ImageThumbnail;
