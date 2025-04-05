// NW.js utilities for file system operations
import fs from 'fs';
import path from 'path';

// Get NW.js window object
const nwWin = nw.Window.get();

/**
 * Open a directory selection dialog
 * @returns {Promise<Object>} Result object with directoryPath or canceled flag
 */
export const selectDirectory = () => {
  return new Promise((resolve) => {
    // Create a temporary input element for directory selection
    const chooser = document.createElement('input');
    chooser.type = 'file';
    chooser.nwdirectory = true; // NW.js specific attribute for directory selection
    chooser.style.display = 'none';
    
    document.body.appendChild(chooser);
    
    chooser.addEventListener('change', function() {
      const directoryPath = this.value;
      document.body.removeChild(chooser);
      
      if (directoryPath) {
        resolve({ canceled: false, directoryPath });
      } else {
        resolve({ canceled: true });
      }
    });
    
    // Simulate a click to open the dialog
    chooser.click();
  });
};

/**
 * Get images from a directory
 * @param {string} directoryPath - Path to the directory
 * @returns {Promise<Array>} Array of image objects
 */
export const getImages = async (directoryPath) => {
  try {
    const files = fs.readdirSync(directoryPath);
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.avif'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // Return image file information
    return imageFiles.map(file => {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: `file://${filePath}`,
        lastModified: stats.mtime.getTime(),
        lastModifiedDate: stats.mtime.toISOString()
      };
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
};

/**
 * Check if a directory exists
 * @param {string} directoryPath - Path to check
 * @returns {Promise<boolean>} True if directory exists
 */
export const checkDirectoryExists = async (directoryPath) => {
  try {
    if (!directoryPath) return false;
    
    const stats = fs.statSync(directoryPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

/**
 * Delete a file
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<Object>} Result object
 */
export const deleteFile = async (filePath) => {
  try {
    // Remove file:// protocol if present
    if (filePath.startsWith('file://')) {
      filePath = filePath.substring(7);
    }
    
    // Show confirmation dialog
    const result = await showConfirmDialog(
      '削除の確認',
      '本当にこのファイルを削除しますか？',
      `ファイル: ${path.basename(filePath)}`
    );
    
    if (!result) {
      return { success: false, canceled: true };
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    return { success: true, filePath };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Show a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} detail - Additional details
 * @returns {Promise<boolean>} True if confirmed
 */
const showConfirmDialog = (title, message, detail) => {
  return new Promise((resolve) => {
    // Create custom dialog
    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'custom-dialog-overlay';
    dialogContainer.innerHTML = `
      <div class="custom-dialog">
        <h3>${title}</h3>
        <p>${message}</p>
        <p class="detail">${detail}</p>
        <div class="dialog-buttons">
          <button class="cancel-button">キャンセル</button>
          <button class="confirm-button">削除</button>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .custom-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .custom-dialog {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }
      .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
        gap: 10px;
      }
      .cancel-button {
        padding: 8px 16px;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .confirm-button {
        padding: 8px 16px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
      }
      .detail {
        font-size: 14px;
        color: #666;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(dialogContainer);
    
    // Add event listeners
    const cancelButton = dialogContainer.querySelector('.cancel-button');
    const confirmButton = dialogContainer.querySelector('.confirm-button');
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialogContainer);
      document.head.removeChild(style);
      resolve(false);
    });
    
    confirmButton.addEventListener('click', () => {
      document.body.removeChild(dialogContainer);
      document.head.removeChild(style);
      resolve(true);
    });
  });
};
