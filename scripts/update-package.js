const fs = require('fs');
const path = require('path');

console.log('📦 Updating package.json for deployment...');

// Đọc package.json hiện tại
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Cập nhật thông tin repository (người dùng cần thay đổi)
const newPackageJson = {
    ...packageJson,
    repository: {
        type: 'git',
        url: 'https://github.com/your-username/carbonate-browser.git'
    },
    homepage: 'https://your-username.github.io/carbonate-browser',
    bugs: {
        url: 'https://github.com/your-username/carbonate-browser/issues'
    },
    scripts: {
        ...packageJson.scripts,
        'deploy:github': 'gh-pages -d website',
        'release': 'npm version patch && git push origin main --tags',
        'release:minor': 'npm version minor && git push origin main --tags',
        'release:major': 'npm version major && git push origin main --tags'
    }
};

// Ghi lại package.json
fs.writeFileSync(packagePath, JSON.stringify(newPackageJson, null, 2));

console.log('✅ package.json updated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Update repository URL in package.json');
console.log('2. Update homepage URL in package.json');
console.log('3. Create GitHub repository');
console.log('4. Push code to GitHub');
console.log('5. Create first release with tag v1.0.0');
