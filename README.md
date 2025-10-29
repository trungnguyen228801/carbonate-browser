# Carbonate Browser

A fast, lightweight Chromium-based desktop browser built with Electron, featuring built-in apps and curated content for an enhanced browsing experience.

## Features

### 🚀 Core Browser Features
- **Chromium-based**: Built on Electron for fast, modern web browsing
- **Search Autocomplete**: Intelligent search suggestions with Yahoo as the default search engine
- **Tab Management**: Full tab support with keyboard shortcuts
- **Bookmark Management**: Import, export, and organize bookmarks
- **Auto-launch**: Start with Windows for quick access

### 📱 Built-in Apps
- **Calculator**: Basic calculator for quick calculations
- **Notes**: Take and save notes locally
- **Weather**: Check current weather and forecast
- **News**: Latest news from various sources
- **Calendar**: Calendar and event management
- **Files**: File manager and browser
- **Settings**: Browser settings and preferences
- **Help**: Help and support information

### 🔧 Easy Migration
- **Import Bookmarks**: Seamlessly transfer bookmarks from Chrome, Firefox, and other browsers
- **Import Settings**: Transfer search engine preferences and other settings
- **Auto-detection**: Automatically detect and import from common browser locations

### 🎨 Modern Interface
- **Clean Design**: Modern, intuitive user interface
- **Dark Mode Support**: Automatic dark mode detection
- **Responsive**: Works on different screen sizes
- **Customizable**: Personalize your browsing experience

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd carbonate-browser
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

### Starting the Browser
```bash
npm start
```

### Keyboard Shortcuts
- `Ctrl+T` - New tab
- `Ctrl+N` - New window
- `Ctrl+D` - Add bookmark
- `Ctrl+,` - Open settings
- `F5` - Refresh page
- `Ctrl+W` - Close tab
- `Ctrl+Tab` - Switch to next tab
- `Ctrl+Shift+Tab` - Switch to previous tab

### Importing Data
1. Go to **File > Import Bookmarks**
2. Select your bookmarks file (HTML or JSON format)
3. The browser will automatically import and organize your bookmarks

### Built-in Apps
Access built-in apps from:
- The new tab page
- The apps button in the navigation bar
- The apps modal

## Development

### Project Structure
```
carbonate-browser/
├── src/
│   ├── main.js              # Main Electron process
│   ├── preload.js           # Preload script for security
│   ├── renderer/            # Renderer process files
│   │   ├── index.html       # Main HTML file
│   │   ├── styles/          # CSS files
│   │   └── js/              # JavaScript files
│   └── utils/               # Utility functions
├── assets/                  # Static assets
└── package.json            # Project configuration
```

### Key Components
- **Main Process** (`src/main.js`): Handles window creation, menu setup, and IPC
- **Renderer Process** (`src/renderer/`): UI and user interactions
- **Apps System** (`src/renderer/js/apps.js`): Built-in applications
- **Search System** (`src/renderer/js/search.js`): Search autocomplete and suggestions
- **Bookmarks** (`src/renderer/js/bookmarks.js`): Bookmark management
- **Tabs** (`src/renderer/js/tabs.js`): Tab management system

### Adding New Apps
1. Register the app in `src/renderer/js/apps.js`
2. Add the app HTML template
3. Implement the app functionality
4. Add any necessary styling

## Configuration

### Settings
The browser stores settings in Electron's secure storage:
- Search engine preferences
- Auto-launch settings
- Bookmark display options
- Custom app configurations

### Search Engines
Supported search engines:
- Yahoo (default)
- Google
- Bing

## Building and Distribution

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Create Installer
```bash
npm run dist
```

The installer will be created in the `dist/` directory.

## Browser Import Support

### Supported Formats
- **HTML Bookmarks**: Chrome, Firefox, Safari exports
- **JSON Bookmarks**: Custom bookmark exports
- **Auto-detection**: Automatic detection of browser data

### Supported Browsers
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari (macOS)

## Performance

### Optimizations
- **Lightweight**: Minimal resource usage
- **Fast Startup**: Optimized for quick launch times
- **Efficient Memory**: Smart memory management
- **Caching**: Intelligent caching for better performance

## Security

### Security Features
- **Context Isolation**: Secure renderer process
- **No Node Integration**: Disabled in renderer for security
- **Preload Scripts**: Secure communication between processes
- **Auto-updates**: Built-in update mechanism

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Check the built-in Help app
- Review the documentation
- Open an issue on GitHub

## Roadmap

### Planned Features
- [ ] WebExtensions support
- [ ] Sync across devices
- [ ] Advanced privacy features
- [ ] Custom themes
- [ ] More built-in apps
- [ ] Voice search
- [ ] Gesture support

---

**Carbonate Browser** - Fast, lightweight browsing with built-in apps and curated content.





