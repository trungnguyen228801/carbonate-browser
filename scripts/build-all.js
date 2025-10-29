const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Carbonate Browser for all platforms...\n');

// Tạo thư mục dist nếu chưa có
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

try {
    // Build cho Windows
    console.log('📦 Building for Windows...');
    execSync('npm run dist:win', { stdio: 'inherit' });
    console.log('✅ Windows build completed\n');

    // Build cho macOS (chỉ trên macOS)
    if (process.platform === 'darwin') {
        console.log('📦 Building for macOS...');
        execSync('npm run dist:mac', { stdio: 'inherit' });
        console.log('✅ macOS build completed\n');
    }

    // Build cho Linux
    console.log('📦 Building for Linux...');
    execSync('npm run dist:linux', { stdio: 'inherit' });
    console.log('✅ Linux build completed\n');

    // Tạo file checksums
    console.log('🔐 Generating checksums...');
    const distFiles = fs.readdirSync('dist');
    const checksums = {};

    distFiles.forEach(file => {
        const filePath = path.join('dist', file);
        const stats = fs.statSync(filePath);
        checksums[file] = {
            size: stats.size,
            modified: stats.mtime
        };
    });

    fs.writeFileSync('dist/checksums.json', JSON.stringify(checksums, null, 2));
    console.log('✅ Checksums generated\n');

    console.log('🎉 All builds completed successfully!');
    console.log('📁 Files are available in the dist/ directory');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}





