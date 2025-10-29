const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Carbonate Browser - Deploy Script');
console.log('=====================================\n');

// Cấu hình deploy
const config = {
    version: process.env.npm_package_version || '1.0.0',
    platforms: ['win', 'mac', 'linux'],
    outputDir: 'dist',
    releaseDir: 'release'
};

// Tạo thư mục release nếu chưa có
if (!fs.existsSync(config.releaseDir)) {
    fs.mkdirSync(config.releaseDir);
}

async function buildForPlatform(platform) {
    console.log(`📦 Building for ${platform}...`);
    
    try {
        let command;
        switch(platform) {
            case 'win':
                command = 'npm run dist:win';
                break;
            case 'mac':
                command = 'npm run dist:mac';
                break;
            case 'linux':
                command = 'npm run dist:linux';
                break;
        }
        
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${platform} build completed\n`);
        
        // Copy files to release directory
        const distFiles = fs.readdirSync(config.outputDir);
        distFiles.forEach(file => {
            if (file.includes(platform) || file.includes('win32') || file.includes('darwin') || file.includes('linux')) {
                const srcPath = path.join(config.outputDir, file);
                const destPath = path.join(config.releaseDir, file);
                fs.copyFileSync(srcPath, destPath);
                console.log(`📁 Copied ${file} to release directory`);
            }
        });
        
    } catch (error) {
        console.error(`❌ ${platform} build failed:`, error.message);
        throw error;
    }
}

async function createReleaseInfo() {
    console.log('📝 Creating release information...');
    
    const releaseInfo = {
        version: config.version,
        releaseDate: new Date().toISOString(),
        platforms: {},
        files: []
    };
    
    // Scan release directory for files
    const releaseFiles = fs.readdirSync(config.releaseDir);
    
    releaseFiles.forEach(file => {
        const filePath = path.join(config.releaseDir, file);
        const stats = fs.statSync(filePath);
        
        let platform = 'unknown';
        if (file.includes('win32') || file.includes('.exe') || file.includes('.msi')) {
            platform = 'windows';
        } else if (file.includes('darwin') || file.includes('.dmg') || file.includes('.pkg')) {
            platform = 'macos';
        } else if (file.includes('linux') || file.includes('.AppImage') || file.includes('.deb') || file.includes('.rpm')) {
            platform = 'linux';
        }
        
        const fileInfo = {
            name: file,
            size: stats.size,
            platform: platform,
            downloadUrl: `https://github.com/your-username/carbonate-browser/releases/download/v${config.version}/${file}`,
            checksum: 'sha256:' + require('crypto').createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
        };
        
        releaseInfo.files.push(fileInfo);
        
        if (!releaseInfo.platforms[platform]) {
            releaseInfo.platforms[platform] = [];
        }
        releaseInfo.platforms[platform].push(fileInfo);
    });
    
    // Lưu thông tin release
    fs.writeFileSync(
        path.join(config.releaseDir, 'release-info.json'), 
        JSON.stringify(releaseInfo, null, 2)
    );
    
    // Tạo file README cho release
    const readmeContent = `# Carbonate Browser v${config.version}

## Downloads

### Windows
${releaseInfo.platforms.windows ? releaseInfo.platforms.windows.map(f => `- [${f.name}](${f.downloadUrl}) (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join('\n') : 'No Windows builds available'}

### macOS
${releaseInfo.platforms.macos ? releaseInfo.platforms.macos.map(f => `- [${f.name}](${f.downloadUrl}) (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join('\n') : 'No macOS builds available'}

### Linux
${releaseInfo.platforms.linux ? releaseInfo.platforms.linux.map(f => `- [${f.name}](${f.downloadUrl}) (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join('\n') : 'No Linux builds available'}

## Installation Instructions

### Windows
1. Download the .exe installer
2. Run the installer as administrator
3. Follow the installation wizard

### macOS
1. Download the .dmg file
2. Open the .dmg file
3. Drag Carbonate Browser to Applications folder

### Linux
1. Download the .AppImage file
2. Make it executable: \`chmod +x Carbonate-Browser-*.AppImage\`
3. Run: \`./Carbonate-Browser-*.AppImage\`

## System Requirements

- Windows 10/11 (64-bit)
- macOS 10.14 or later
- Linux (Ubuntu 18.04+, CentOS 7+, etc.)

## Release Date
${new Date(releaseInfo.releaseDate).toLocaleDateString()}
`;
    
    fs.writeFileSync(path.join(config.releaseDir, 'README.md'), readmeContent);
    
    console.log('✅ Release information created');
}

async function main() {
    try {
        console.log(`Building version ${config.version}\n`);
        
        // Build for each platform
        for (const platform of config.platforms) {
            await buildForPlatform(platform);
        }
        
        // Create release information
        await createReleaseInfo();
        
        console.log('\n🎉 Deploy completed successfully!');
        console.log(`📁 Release files are in: ${config.releaseDir}/`);
        console.log('\nNext steps:');
        console.log('1. Upload files to GitHub Releases');
        console.log('2. Update your website with download links');
        console.log('3. Share the release with users');
        
    } catch (error) {
        console.error('\n❌ Deploy failed:', error.message);
        process.exit(1);
    }
}

main();
