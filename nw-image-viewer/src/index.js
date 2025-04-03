import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NW.js specific setup
document.addEventListener('DOMContentLoaded', () => {
  // Set up global error handling
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', message, 'at', source, lineno, colno);
    console.error('Error object:', error);
    return true; // Prevents the default error handling
  };

  // Create a root for React
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // Render the App component
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Set up NW.js window
  if (typeof nw !== 'undefined') {
    const win = nw.Window.get();
    
    // Handle window close event
    win.on('close', function() {
      // Clean up and close
      this.close(true);
    });
  }
});
