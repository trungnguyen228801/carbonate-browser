const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const Store = require('electron-store');

const store = new Store();

class AutoUpdater {
    constructor() {
        this.isUpdateAvailable = false;
        this.updateInfo = null;
        this.init();
    }

    init() {
        // Cấu hình auto-updater
        autoUpdater.checkForUpdatesAndNotify();
        
        // Kiểm tra cập nhật mỗi 4 giờ
        setInterval(() => {
            this.checkForUpdates();
        }, 4 * 60 * 60 * 1000);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Có cập nhật mới
        autoUpdater.on('update-available', (info) => {
            this.isUpdateAvailable = true;
            this.updateInfo = info;
            this.showUpdateNotification(info);
        });

        // Không có cập nhật
        autoUpdater.on('update-not-available', (info) => {
            console.log('No updates available');
        });

        // Lỗi khi kiểm tra cập nhật
        autoUpdater.on('error', (error) => {
            console.error('Auto-updater error:', error);
        });

        // Tải cập nhật hoàn tất
        autoUpdater.on('update-downloaded', (info) => {
            this.showUpdateReadyDialog(info);
        });

        // Tiến trình tải cập nhật
        autoUpdater.on('download-progress', (progressObj) => {
            this.showDownloadProgress(progressObj);
        });
    }

    async checkForUpdates() {
        try {
            // Kiểm tra cài đặt auto-update
            const autoUpdateEnabled = store.get('autoUpdate', true);
            if (!autoUpdateEnabled) {
                return;
            }

            // Kiểm tra cập nhật
            const result = await autoUpdater.checkForUpdates();
            return result;
        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    }

    showUpdateNotification(info) {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (!mainWindow) return;

        const options = {
            type: 'info',
            title: 'Cập nhật có sẵn',
            message: `Phiên bản mới ${info.version} đã có sẵn!`,
            detail: 'Carbonate Browser sẽ tự động tải và cài đặt cập nhật.',
            buttons: ['Tải ngay', 'Để sau'],
            defaultId: 0,
            cancelId: 1
        };

        dialog.showMessageBox(mainWindow, options).then((result) => {
            if (result.response === 0) {
                // Tải cập nhật
                autoUpdater.downloadUpdate();
            }
        });
    }

    showUpdateReadyDialog(info) {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (!mainWindow) return;

        const options = {
            type: 'info',
            title: 'Cập nhật sẵn sàng',
            message: 'Cập nhật đã được tải xong!',
            detail: `Phiên bản ${info.version} đã sẵn sàng cài đặt. Ứng dụng sẽ khởi động lại để hoàn tất cập nhật.`,
            buttons: ['Cài đặt ngay', 'Cài đặt sau'],
            defaultId: 0,
            cancelId: 1
        };

        dialog.showMessageBox(mainWindow, options).then((result) => {
            if (result.response === 0) {
                // Cài đặt cập nhật
                autoUpdater.quitAndInstall();
            }
        });
    }

    showDownloadProgress(progressObj) {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (!mainWindow) return;

        const message = `Đang tải cập nhật: ${Math.round(progressObj.percent)}%`;
        const detail = `Tốc độ: ${Math.round(progressObj.bytesPerSecond / 1024)} KB/s`;

        // Gửi thông tin tiến trình đến renderer
        mainWindow.webContents.send('update-download-progress', {
            percent: progressObj.percent,
            bytesPerSecond: progressObj.bytesPerSecond,
            total: progressObj.total,
            transferred: progressObj.transferred
        });
    }

    // Kiểm tra cập nhật thủ công
    async checkForUpdatesManually() {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (!mainWindow) return;

        try {
            mainWindow.webContents.send('update-checking');
            
            const result = await this.checkForUpdates();
            
            if (result && result.updateInfo) {
                mainWindow.webContents.send('update-available', result.updateInfo);
            } else {
                mainWindow.webContents.send('update-not-available');
            }
        } catch (error) {
            mainWindow.webContents.send('update-error', error.message);
        }
    }

    // Cài đặt cập nhật
    installUpdate() {
        autoUpdater.quitAndInstall();
    }

    // Bật/tắt auto-update
    setAutoUpdate(enabled) {
        store.set('autoUpdate', enabled);
    }

    // Lấy trạng thái auto-update
    isAutoUpdateEnabled() {
        return store.get('autoUpdate', true);
    }

    // Lấy thông tin phiên bản hiện tại
    getCurrentVersion() {
        return autoUpdater.currentVersion;
    }

    // Lấy thông tin cập nhật
    getUpdateInfo() {
        return this.updateInfo;
    }
}

module.exports = AutoUpdater;





