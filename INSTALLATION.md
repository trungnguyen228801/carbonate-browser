# 📥 Hướng Dẫn Cài Đặt Carbonate Browser

## 🖥️ **Cài Đặt Trên Windows**

### Phương Pháp 1: File Cài Đặt (.exe)
1. **Tải file cài đặt:**
   - Tải file `Carbonate Browser Setup.exe` từ trang tải về
   - Kích thước: ~150MB

2. **Chạy file cài đặt:**
   - Double-click vào file `.exe`
   - Chọn "Yes" khi Windows hỏi về quyền quản trị
   - Làm theo hướng dẫn cài đặt

3. **Hoàn tất cài đặt:**
   - Chọn thư mục cài đặt (mặc định: `C:\Program Files\Carbonate Browser`)
   - Tạo shortcut trên Desktop và Start Menu
   - Tự động khởi chạy sau khi cài đặt

### Phương Pháp 2: Portable Version
1. **Tải file portable:**
   - Tải file `Carbonate Browser Portable.zip`
   - Giải nén vào thư mục bất kỳ
   - Chạy file `Carbonate Browser.exe`

## 🍎 **Cài Đặt Trên macOS**

### Phương Pháp 1: File DMG
1. **Tải file DMG:**
   - Tải file `Carbonate Browser.dmg`
   - Double-click để mount

2. **Cài đặt:**
   - Kéo ứng dụng vào thư mục Applications
   - Mở Applications và chạy Carbonate Browser
   - Cho phép ứng dụng chạy khi macOS hỏi

### Phương Pháp 2: Homebrew (Cho Developer)
```bash
brew install --cask carbonate-browser
```

## 🐧 **Cài Đặt Trên Linux**

### Ubuntu/Debian (.deb)
```bash
# Tải file .deb
wget https://releases.carbonate-browser.com/latest/carbonate-browser_1.0.0_amd64.deb

# Cài đặt
sudo dpkg -i carbonate-browser_1.0.0_amd64.deb

# Cài đặt dependencies nếu cần
sudo apt-get install -f
```

### Fedora/RHEL (.rpm)
```bash
# Tải file .rpm
wget https://releases.carbonate-browser.com/latest/carbonate-browser-1.0.0.x86_64.rpm

# Cài đặt
sudo rpm -i carbonate-browser-1.0.0.x86_64.rpm
```

### AppImage (Universal)
```bash
# Tải file AppImage
wget https://releases.carbonate-browser.com/latest/Carbonate-Browser.AppImage

# Cấp quyền thực thi
chmod +x Carbonate-Browser.AppImage

# Chạy ứng dụng
./Carbonate-Browser.AppImage
```

### Snap Package
```bash
sudo snap install carbonate-browser
```

## 🔧 **Yêu Cầu Hệ Thống**

### Windows
- Windows 10/11 (64-bit)
- RAM: Tối thiểu 4GB, Khuyến nghị 8GB
- Dung lượng: 200MB trống
- .NET Framework 4.7.2 hoặc cao hơn

### macOS
- macOS 10.14 (Mojave) hoặc cao hơn
- RAM: Tối thiểu 4GB, Khuyến nghị 8GB
- Dung lượng: 200MB trống

### Linux
- Ubuntu 18.04+ / Fedora 30+ / Debian 10+
- RAM: Tối thiểu 4GB, Khuyến nghị 8GB
- Dung lượng: 200MB trống
- GTK+ 3.0 hoặc cao hơn

## 🚀 **Sau Khi Cài Đặt**

### Lần Đầu Khởi Chạy
1. **Import dữ liệu từ trình duyệt khác:**
   - Chọn "Import Now" khi được hỏi
   - Chọn file bookmarks từ Chrome/Firefox
   - Hoặc chọn "Skip" để bỏ qua

2. **Cấu hình cài đặt:**
   - Chọn search engine mặc định (Yahoo/Google/Bing)
   - Bật/tắt auto-launch khi khởi động Windows
   - Cấu hình các tùy chọn khác

### Tính Năng Chính
- **Tìm kiếm:** Gõ trực tiếp vào thanh địa chỉ
- **Apps tích hợp:** Truy cập từ trang New Tab
- **Bookmarks:** Quản lý từ menu hoặc Ctrl+Shift+O
- **Settings:** Mở bằng Ctrl+, hoặc từ menu Tools

## 🔄 **Cập Nhật Ứng Dụng**

### Tự Động Cập Nhật
- Carbonate Browser sẽ tự động kiểm tra cập nhật
- Thông báo khi có phiên bản mới
- Tải và cài đặt cập nhật tự động

### Cập Nhật Thủ Công
1. Tải phiên bản mới từ trang web
2. Chạy file cài đặt mới
3. Cài đặt sẽ ghi đè lên phiên bản cũ

## 🗑️ **Gỡ Cài Đặt**

### Windows
1. Mở "Add or Remove Programs"
2. Tìm "Carbonate Browser"
3. Click "Uninstall"
4. Xóa thư mục cài đặt nếu cần

### macOS
1. Mở Applications folder
2. Kéo Carbonate Browser vào Trash
3. Xóa dữ liệu người dùng (tùy chọn):
   ```bash
   rm -rf ~/Library/Application\ Support/Carbonate\ Browser
   ```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get remove carbonate-browser

# Fedora/RHEL
sudo rpm -e carbonate-browser

# Snap
sudo snap remove carbonate-browser
```

## ❓ **Khắc Phục Sự Cố**

### Lỗi Thường Gặp

**"Ứng dụng không khởi động"**
- Kiểm tra yêu cầu hệ thống
- Chạy với quyền quản trị (Windows)
- Cài đặt lại ứng dụng

**"Không thể import bookmarks"**
- Kiểm tra định dạng file (HTML/JSON)
- Đảm bảo file không bị hỏng
- Thử import từng file nhỏ

**"Ứng dụng chạy chậm"**
- Đóng các tab không cần thiết
- Khởi động lại ứng dụng
- Kiểm tra RAM và CPU usage

### Liên Hệ Hỗ Trợ
- Email: support@carbonate-browser.com
- Website: https://carbonate-browser.com/support
- GitHub Issues: https://github.com/carbonate-browser/issues

---

**Carbonate Browser** - Trình duyệt nhanh, nhẹ với ứng dụng tích hợp





