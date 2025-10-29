# Carbonate Browser Desktop

A modern, secure desktop browser built with Electron and React. Features include multi-tab browsing, bookmarks, history, download manager, incognito mode, and basic extension support.

## Features

### Core Features
- **Multi-tab browsing** with drag-and-drop reordering
- **Bookmark management** with folders and import/export
- **Browsing history** with search and statistics
- **Download manager** with pause/resume functionality
- **Incognito mode** for private browsing
- **Settings page** with comprehensive options
- **Sidebar** for quick access to bookmarks and history

### Security Features
- **Context isolation** enabled
- **Node integration** disabled in renderer
- **Content Security Policy** (CSP) implemented
- **URL validation** and sanitization
- **XSS protection** with input sanitization
- **Secure IPC** with channel whitelisting

### Extension Support
- **Manifest v2** compatible
- **Content scripts** support
- **Background scripts** support
- **Permission model** with whitelist
- **Message passing** API

## Installation

### Prerequisites
- Node.js 16+ 
- npm 8+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/carbonate-browser/carbonate-browser-desktop.git
   cd carbonate-browser-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Create distributables**
   ```bash
   npm run dist
   ```

## Development

### Project Structure
```
browser-desktop/
├── src/
│   ├── main.js                 # Electron main process
│   ├── preload.js              # Preload script
│   ├── database/
│   │   └── database.js         # SQLite database manager
│   ├── core/
│   │   ├── tab-manager.js      # Tab management
│   │   ├── bookmark-manager.js # Bookmark CRUD
│   │   ├── history-manager.js  # History management
│   │   ├── download-manager.js # Download handling
│   │   ├── extension-manager.js # Extension system
│   │   └── security-manager.js # Security utilities
│   └── renderer/
│       ├── index.html          # Main HTML
│       ├── app.js              # React app entry
│       └── components/         # React components
├── assets/                     # Icons and images
├── dist/                       # Built files
├── package.json
├── webpack.main.config.js
├── webpack.renderer.config.js
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Create distributables
- `npm run dist:win` - Build Windows installer
- `npm run dist:mac` - Build macOS DMG
- `npm run dist:linux` - Build Linux AppImage
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

### Database

The browser uses SQLite for data persistence:
- **Bookmarks** - Title, URL, favicon, folder
- **History** - Title, URL, visit count, timestamps
- **Downloads** - Filename, URL, progress, status
- **Settings** - Key-value configuration
- **Extensions** - Manifest, permissions, state

### Security Implementation

#### Main Process Security
- Context isolation enabled
- Node integration disabled in renderer
- Preload script for safe IPC
- URL validation and sanitization
- CSP headers implemented

#### Renderer Process Security
- No direct Node.js access
- Sanitized input handling
- XSS protection
- Secure message passing

#### Extension Security
- Manifest validation
- Permission whitelist
- Sandboxed execution
- Content script isolation

## Building

### Windows
```bash
npm run dist:win
```
Creates NSIS installer in `dist/` directory.

### macOS
```bash
npm run dist:mac
```
Creates DMG file in `dist/` directory.

### Linux
```bash
npm run dist:linux
```
Creates AppImage in `dist/` directory.

## Extension Development

### Creating an Extension

1. Create a folder with `manifest.json`:
   ```json
   {
     "name": "My Extension",
     "version": "1.0.0",
     "manifest_version": 2,
     "permissions": ["tabs", "bookmarks"],
     "content_scripts": [{
       "matches": ["<all_urls>"],
       "js": ["content.js"]
     }],
     "background": {
       "scripts": ["background.js"]
     }
   }
   ```

2. Install in development mode:
   ```javascript
   await window.electronAPI.installExtension('/path/to/extension');
   ```

### Extension API

Available APIs:
- `tabs` - Tab management
- `bookmarks` - Bookmark operations
- `storage` - Local storage
- `notifications` - System notifications

## Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Performance Testing
- Time to first paint
- Memory usage per tab
- CPU usage during downloads
- Extension load time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Security Checklist

### P0 (Critical)
- [ ] Context isolation enabled
- [ ] Node integration disabled
- [ ] CSP headers implemented
- [ ] URL validation active
- [ ] Input sanitization working

### P1 (High)
- [ ] Extension permission model
- [ ] Secure IPC channels
- [ ] XSS protection
- [ ] File access restrictions
- [ ] Network security

### P2 (Medium)
- [ ] Update verification
- [ ] Code signing
- [ ] Dependency scanning
- [ ] Error handling
- [ ] Logging security

## Roadmap

### v1.1
- [ ] Advanced extension APIs
- [ ] Theme customization
- [ ] Sync capabilities
- [ ] Advanced privacy features

### v1.2
- [ ] Multi-profile support
- [ ] Advanced download features
- [ ] Custom search engines
- [ ] Developer tools

### v2.0
- [ ] Chromium Embedded Framework
- [ ] Advanced security features
- [ ] Enterprise features
- [ ] Mobile companion app

## Support

- GitHub Issues: [Report bugs](https://github.com/carbonate-browser/carbonate-browser-desktop/issues)
- Documentation: [Wiki](https://github.com/carbonate-browser/carbonate-browser-desktop/wiki)
- Community: [Discussions](https://github.com/carbonate-browser/carbonate-browser-desktop/discussions)

## Acknowledgments

- Electron team for the framework
- React team for the UI library
- SQLite for the database
- All contributors and testers
