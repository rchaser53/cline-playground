import React from 'react';

const PositionControls = ({ position, onPositionChange }) => {
  return (
    <div className="position-controls">
      <label htmlFor="image-position">画像位置:</label>
      <select
        id="image-position"
        value={position}
        onChange={(e) => onPositionChange(e.target.value)}
      >
        <option value="top">上</option>
        <option value="center">中央</option>
        <option value="bottom">下</option>
      </select>
    </div>
  );
};

export default PositionControls;
