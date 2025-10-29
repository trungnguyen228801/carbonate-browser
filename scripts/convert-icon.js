const fs = require('fs');
const path = require('path');

console.log('🖼️ Converting icon.png to icon.ico...');

// Kiểm tra xem icon.png có tồn tại không
const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');

if (!fs.existsSync(iconPath)) {
    console.error('❌ icon.png not found in assets folder');
    process.exit(1);
}

// Tạo file .ico đơn giản (copy png thành ico)
// Trong thực tế, bạn nên sử dụng tool chuyên dụng như ImageMagick
try {
    fs.copyFileSync(iconPath, icoPath);
    console.log('✅ icon.ico created successfully');
    console.log('📝 Note: For production, use a proper icon converter like ImageMagick');
    console.log('   Command: magick convert assets/icon.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico');
} catch (error) {
    console.error('❌ Error creating icon.ico:', error.message);
    process.exit(1);
}
