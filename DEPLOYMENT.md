# 🚀 Hướng Dẫn Deploy Carbonate Browser

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn đẩy ứng dụng Carbonate Browser lên mạng và cho phép người dùng tải về trên các nền tảng khác nhau.

## 🛠️ Chuẩn Bị

### 1. Cài Đặt Dependencies

```bash
npm install
```

### 2. Cấu Hình GitHub Repository

1. Tạo repository trên GitHub
2. Cập nhật `package.json` với thông tin repository của bạn:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/carbonate-browser.git"
  },
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "carbonate-browser"
    }
  }
}
```

## 🏗️ Build Ứng Dụng

### Build Tất Cả Nền Tảng

```bash
# Build cho tất cả nền tảng
npm run build:all

# Hoặc build từng nền tảng riêng lẻ
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

### Build Script Tự Động

```bash
# Sử dụng script deploy tự động
node scripts/deploy.js
```

## 🌐 Các Phương Thức Deploy

### 1. GitHub Releases (Khuyến Nghị)

#### Tự Động với GitHub Actions

1. Push code lên GitHub
2. Tạo tag version:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions sẽ tự động build và tạo release

#### Thủ Công

1. Build ứng dụng:
   ```bash
   npm run build:all
   ```

2. Tạo release trên GitHub:
   - Vào repository → Releases → Create a new release
   - Upload các file từ thư mục `dist/`
   - Viết release notes

### 2. Website Tĩnh

#### GitHub Pages

1. Enable GitHub Pages trong repository settings
2. Upload file `website/index.html` vào thư mục `docs/`
3. Cập nhật link download trong file HTML

#### Netlify

1. Kết nối repository với Netlify
2. Set build command: `npm run build:all`
3. Set publish directory: `website/`
4. Deploy tự động khi có thay đổi

#### Vercel

1. Import project từ GitHub
2. Set build command: `npm run build:all`
3. Set output directory: `website/`

### 3. App Stores

#### Microsoft Store

1. Tạo tài khoản developer Microsoft
2. Package ứng dụng với MSIX format
3. Submit qua Microsoft Partner Center

#### Mac App Store

1. Tạo tài khoản Apple Developer
2. Cấu hình code signing
3. Submit qua App Store Connect

#### Snap Store (Linux)

1. Tạo tài khoản Snapcraft
2. Tạo file `snapcraft.yaml`
3. Submit: `snapcraft upload carbonate-browser_*.snap`

## 📦 Các Loại File Build

### Windows
- **NSIS Installer** (.exe): Cài đặt tiêu chuẩn
- **Portable** (.exe): Chạy trực tiếp, không cần cài đặt
- **MSI** (.msi): Cho enterprise deployment

### macOS
- **DMG** (.dmg): Cài đặt tiêu chuẩn
- **ZIP** (.zip): Portable version
- **PKG** (.pkg): Cho enterprise deployment

### Linux
- **AppImage** (.AppImage): Universal, chạy trên mọi distro
- **DEB** (.deb): Cho Ubuntu, Debian
- **RPM** (.rpm): Cho Fedora, RHEL
- **Snap** (.snap): Universal package

## 🔧 Cấu Hình Nâng Cao

### Code Signing

#### Windows

1. Mua certificate từ DigiCert, Sectigo, etc.
2. Cấu hình trong `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

#### macOS

1. Tạo certificate trong Apple Developer Portal
2. Cấu hình:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name"
    }
  }
}
```

### Auto Updater

1. Cấu hình publish trong `package.json`
2. Implement auto-updater trong main process:

```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

### Analytics & Tracking

1. Thêm Google Analytics vào website
2. Track download events
3. Monitor usage statistics

## 🚀 Workflow Deploy Hoàn Chỉnh

### 1. Development

```bash
# Phát triển tính năng mới
git checkout -b feature/new-feature
# ... code changes ...
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 2. Release

```bash
# Merge vào main
git checkout main
git merge feature/new-feature

# Tạo release
npm version patch  # hoặc minor, major
git push origin main --tags
```

### 3. Deploy

- GitHub Actions tự động build và tạo release
- Website tự động cập nhật link download
- Users nhận thông báo update

## 📊 Monitoring & Analytics

### 1. Download Statistics

- GitHub Releases: Xem trong repository insights
- Google Analytics: Track website traffic
- Custom analytics: Implement trong app

### 2. Error Tracking

- Sentry: Track crashes và errors
- LogRocket: Session replay
- Custom logging: Implement trong app

### 3. User Feedback

- GitHub Issues: Bug reports
- Discord/Slack: Community support
- Email: Direct feedback

## 🔒 Bảo Mật

### 1. Code Signing

- Luôn sign các file executable
- Sử dụng certificate hợp lệ
- Renew certificate trước khi hết hạn

### 2. Security Headers

- Cấu hình HTTPS
- Set security headers
- Validate file uploads

### 3. Update Security

- Verify update signatures
- Use HTTPS cho updates
- Implement rollback mechanism

## 📈 Tối Ưu Hóa

### 1. File Size

- Optimize images và assets
- Remove unused dependencies
- Use compression

### 2. Performance

- Lazy loading
- CDN cho static assets
- Caching strategies

### 3. SEO

- Meta tags
- Structured data
- Sitemap

## 🆘 Troubleshooting

### Build Errors

```bash
# Clear cache
npm run clean
rm -rf node_modules
npm install

# Check dependencies
npm audit
npm audit fix
```

### Deploy Issues

1. Check GitHub Actions logs
2. Verify repository permissions
3. Check file paths và names

### User Issues

1. Check system requirements
2. Verify download links
3. Test installation process

## 📞 Hỗ Trợ

- GitHub Issues: Bug reports và feature requests
- Email: support@carbonate-browser.com
- Discord: Community support

---

**Lưu ý:** Thay thế `your-username` và `carbonate-browser` bằng thông tin repository thực tế của bạn.
