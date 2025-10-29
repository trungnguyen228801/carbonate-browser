# Hướng Dẫn Tạo File Cài Đặt Carbonate Browser

## 1. Cài Đặt Electron Builder

```bash
npm install --save-dev electron-builder
```

## 2. Cấu Hình Package.json

Đã có sẵn trong package.json:
```json
{
  "build": {
    "appId": "com.carbonate.browser",
    "productName": "Carbonate Browser",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "assets/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "runAfterFinish": true
    }
  }
}
```

## 3. Tạo File Cài Đặt

### Windows (.exe)
```bash
npm run dist
```

### macOS (.dmg)
```bash
npm run dist:mac
```

### Linux (.AppImage)
```bash
npm run dist:linux
```

## 4. Kết Quả
File cài đặt sẽ được tạo trong thư mục `dist/`:
- Windows: `Carbonate Browser Setup.exe`
- macOS: `Carbonate Browser.dmg`
- Linux: `Carbonate Browser.AppImage`





