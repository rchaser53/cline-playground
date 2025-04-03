import React from 'react';

const SizeControls = ({ thumbnailSize, onSizeChange }) => {
  return (
    <div className="size-controls">
      <label htmlFor="thumbnail-size">サムネイルサイズ:</label>
      <input
        id="thumbnail-size"
        type="range"
        min="100"
        max="500"
        step="10"
        value={thumbnailSize}
        onChange={(e) => onSizeChange(Number(e.target.value))}
      />
      <span>{thumbnailSize}px</span>
    </div>
  );
};

export default SizeControls;
