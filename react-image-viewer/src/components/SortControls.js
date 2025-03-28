import React from 'react';

const SortControls = ({ sortConfig, onSortChange, onDirectionChange }) => {
  return (
    <div className="sort-controls">
      <label htmlFor="sort-by">並び替え:</label>
      <select 
        id="sort-by" 
        value={sortConfig.by} 
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="name">名前</option>
        <option value="lastModified">最終更新日</option>
      </select>
      <button 
        id="sort-direction" 
        title="並び替え方向を切り替え"
        onClick={onDirectionChange}
      >
        <span id="sort-icon">
          {sortConfig.direction === 'asc' ? '↓' : '↑'}
        </span>
      </button>
    </div>
  );
};

export default SortControls;
