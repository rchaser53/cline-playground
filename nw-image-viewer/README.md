# NW.js Image Viewer

A desktop image viewer application built with NW.js and React.

## Features

- Browse and view images from your local directories
- Sort images by name or last modified date
- Adjust thumbnail size
- Control image position in thumbnails (top, center, bottom)
- View images in a modal with navigation controls
- Delete images
- Keyboard shortcuts for navigation and image position

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nw-image-viewer.git
cd nw-image-viewer

# Install dependencies
npm install
```

### Running the application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Keyboard Shortcuts

- `⌘+T` - Set image position to top
- `⌘+C` - Set image position to center
- `⌘+B` - Set image position to bottom
- `←` - Previous image (in modal view)
- `→` - Next image (in modal view)
- `Esc` - Close modal

## License

MIT
