const { app } = require('electron');
const Store = require('electron-store');

const store = new Store();

/**
 * Setup auto-launch functionality
 */
function setupAutoLaunch() {
    // Check if auto-launch is enabled
    const autoLaunchEnabled = store.get('autoLaunch', false);
    
    if (autoLaunchEnabled) {
        enableAutoLaunch();
    }
}

/**
 * Enable auto-launch on system start
 */
function enableAutoLaunch() {
    try {
        const { spawn } = require('child_process');
        const path = require('path');
        
        const platform = process.platform;
        const appPath = app.getPath('exe');
        const appName = app.getName();
        
        if (platform === 'win32') {
            // Windows: Add to startup folder or registry
            enableWindowsAutoLaunch(appPath, appName);
        } else if (platform === 'darwin') {
            // macOS: Add to Login Items
            enableMacOSAutoLaunch(appPath, appName);
        } else if (platform === 'linux') {
            // Linux: Add to autostart directory
            enableLinuxAutoLaunch(appPath, appName);
        }
        
        store.set('autoLaunch', true);
        console.log('Auto-launch enabled');
    } catch (error) {
        console.error('Failed to enable auto-launch:', error);
    }
}

/**
 * Disable auto-launch on system start
 */
function disableAutoLaunch() {
    try {
        const platform = process.platform;
        const appName = app.getName();
        
        if (platform === 'win32') {
            disableWindowsAutoLaunch(appName);
        } else if (platform === 'darwin') {
            disableMacOSAutoLaunch(appName);
        } else if (platform === 'linux') {
            disableLinuxAutoLaunch(appName);
        }
        
        store.set('autoLaunch', false);
        console.log('Auto-launch disabled');
    } catch (error) {
        console.error('Failed to disable auto-launch:', error);
    }
}

/**
 * Enable auto-launch on Windows
 */
function enableWindowsAutoLaunch(appPath, appName) {
    const { spawn } = require('child_process');
    
    // Method 1: Add to startup folder
    const startupFolder = require('path').join(
        require('os').homedir(),
        'AppData',
        'Roaming',
        'Microsoft',
        'Windows',
        'Start Menu',
        'Programs',
        'Startup'
    );
    
    const shortcutPath = require('path').join(startupFolder, `${appName}.lnk`);
    
    // Create shortcut using PowerShell
    const psCommand = `
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
        $Shortcut.TargetPath = "${appPath}"
        $Shortcut.Save()
    `;
    
    spawn('powershell', ['-Command', psCommand], { stdio: 'ignore' });
    
    // Method 2: Add to registry (backup method)
    try {
        const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}" /t REG_SZ /d "${appPath}" /f`;
        spawn('cmd', ['/c', regCommand], { stdio: 'ignore' });
    } catch (error) {
        console.log('Registry method failed, using startup folder only');
    }
}

/**
 * Disable auto-launch on Windows
 */
function disableWindowsAutoLaunch(appName) {
    const { spawn } = require('child_process');
    
    // Remove from startup folder
    const startupFolder = require('path').join(
        require('os').homedir(),
        'AppData',
        'Roaming',
        'Microsoft',
        'Windows',
        'Start Menu',
        'Programs',
        'Startup'
    );
    
    const shortcutPath = require('path').join(startupFolder, `${appName}.lnk`);
    
    try {
        require('fs').unlinkSync(shortcutPath);
    } catch (error) {
        // File might not exist, that's okay
    }
    
    // Remove from registry
    try {
        const regCommand = `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}" /f`;
        spawn('cmd', ['/c', regCommand], { stdio: 'ignore' });
    } catch (error) {
        console.log('Failed to remove from registry');
    }
}

/**
 * Enable auto-launch on macOS
 */
function enableMacOSAutoLaunch(appPath, appName) {
    const { spawn } = require('child_process');
    
    // Add to Login Items using osascript
    const script = `
        tell application "System Events"
            make login item at end with properties {path:"${appPath}", hidden:false}
        end tell
    `;
    
    spawn('osascript', ['-e', script], { stdio: 'ignore' });
}

/**
 * Disable auto-launch on macOS
 */
function disableMacOSAutoLaunch(appName) {
    const { spawn } = require('child_process');
    
    // Remove from Login Items using osascript
    const script = `
        tell application "System Events"
            delete login item "${appName}"
        end tell
    `;
    
    spawn('osascript', ['-e', script], { stdio: 'ignore' });
}

/**
 * Enable auto-launch on Linux
 */
function enableLinuxAutoLaunch(appPath, appName) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    // Create autostart directory if it doesn't exist
    const autostartDir = path.join(os.homedir(), '.config', 'autostart');
    
    try {
        fs.mkdirSync(autostartDir, { recursive: true });
    } catch (error) {
        // Directory might already exist
    }
    
    // Create .desktop file
    const desktopFile = `[Desktop Entry]
Type=Application
Version=1.0
Name=${appName}
Comment=Start ${appName} automatically
Exec=${appPath}
Icon=${appName}
Terminal=false
Hidden=false
X-GNOME-Autostart-enabled=true
`;
    
    const desktopFilePath = path.join(autostartDir, `${appName}.desktop`);
    fs.writeFileSync(desktopFilePath, desktopFile);
    
    // Make it executable
    fs.chmodSync(desktopFilePath, '755');
}

/**
 * Disable auto-launch on Linux
 */
function disableLinuxAutoLaunch(appName) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const desktopFilePath = path.join(
        os.homedir(),
        '.config',
        'autostart',
        `${appName}.desktop`
    );
    
    try {
        fs.unlinkSync(desktopFilePath);
    } catch (error) {
        // File might not exist, that's okay
    }
}

/**
 * Check if auto-launch is currently enabled
 */
function isAutoLaunchEnabled() {
    return store.get('autoLaunch', false);
}

/**
 * Toggle auto-launch setting
 */
function toggleAutoLaunch() {
    const isEnabled = isAutoLaunchEnabled();
    
    if (isEnabled) {
        disableAutoLaunch();
    } else {
        enableAutoLaunch();
    }
    
    return !isEnabled;
}

module.exports = {
    setupAutoLaunch,
    enableAutoLaunch,
    disableAutoLaunch,
    isAutoLaunchEnabled,
    toggleAutoLaunch
};

