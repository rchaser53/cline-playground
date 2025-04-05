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

### Building and Packaging

The application can be built and packaged in two steps:

```bash
# Step 1: Build the application
npm run package
```

This will:
- Compile the React application using webpack
- Create a `build` directory with all necessary files
- Generate a simplified package.json for the build

```bash
# Step 2: Create executables for multiple platforms
npm run create-executables
```

This will create executables in the `build-output` directory for the following platforms:
- Windows (32-bit and 64-bit)
- macOS (64-bit)
- Linux (32-bit and 64-bit)

The executables are created using NW.js directly, without relying on nw-builder. The script `create-executables-direct.js` handles the process of downloading NW.js binaries for each platform and packaging the application files with them.

You can customize the build process by editing the `build.js` file.

### Creating Application Icons

The application uses custom icons for the executables. To create these icons:

```bash
# Run the icon creation guide
npm run create-icons
```

This will provide instructions on how to create the following icon files:
- `icons/icon.icns` - for macOS
- `icons/icon.ico` - for Windows

If these icon files are not present when building the executables, the application will use the default NW.js icons.

## Keyboard Shortcuts

- `⌘+T` - Set image position to top
- `⌘+C` - Set image position to center
- `⌘+B` - Set image position to bottom
- `←` - Previous image (in modal view)
- `→` - Next image (in modal view)
- `Esc` - Close modal

## License

MIT
