const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const Database = require('./database/database');
const TabManager = require('./core/tab-manager');
const BookmarkManager = require('./core/bookmark-manager');
const HistoryManager = require('./core/history-manager');
const DownloadManager = require('./core/download-manager');
const ExtensionManager = require('./core/extension-manager');
const SecurityManager = require('./core/security-manager');

class CarbonateBrowser {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.store = new Store();
    this.database = new Database();
    this.tabManager = new TabManager();
    this.bookmarkManager = new BookmarkManager(this.database);
    this.historyManager = new HistoryManager(this.database);
    this.downloadManager = new DownloadManager();
    this.extensionManager = new ExtensionManager();
    this.securityManager = new SecurityManager();
    
    this.initializeApp();
  }

  initializeApp() {
    // Security: Disable node integration in renderer
    app.commandLine.appendSwitch('--disable-web-security');
    app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
    
    // Enable context isolation
    app.commandLine.appendSwitch('--enable-context-isolation');
    
    // Disable node integration in renderer
    app.commandLine.appendSwitch('--disable-node-integration');
    
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIPC();
      this.setupMenu();
      this.setupTray();
      this.setupAutoUpdater();
      
      // Initialize database
      this.database.initialize();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      titleBarStyle: 'hiddenInset',
      show: false,
      icon: path.join(__dirname, '../assets/icon.png')
    });

    // Load the renderer
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Security: Prevent navigation to file:// or internal schemes
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.protocol === 'file:' || parsedUrl.protocol === 'chrome:') {
        event.preventDefault();
      }
    });

    // Security: Prevent new window creation
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  setupIPC() {
    // Tab management
    ipcMain.handle('tabs:create', async (event, url) => {
      return await this.tabManager.createTab(url);
    });

    ipcMain.handle('tabs:close', async (event, tabId) => {
      return await this.tabManager.closeTab(tabId);
    });

    ipcMain.handle('tabs:getAll', async () => {
      return await this.tabManager.getAllTabs();
    });

    ipcMain.handle('tabs:switch', async (event, tabId) => {
      return await this.tabManager.switchTab(tabId);
    });

    // Bookmark management
    ipcMain.handle('bookmarks:add', async (event, bookmark) => {
      return await this.bookmarkManager.addBookmark(bookmark);
    });

    ipcMain.handle('bookmarks:getAll', async () => {
      return await this.bookmarkManager.getAllBookmarks();
    });

    ipcMain.handle('bookmarks:update', async (event, id, bookmark) => {
      return await this.bookmarkManager.updateBookmark(id, bookmark);
    });

    ipcMain.handle('bookmarks:delete', async (event, id) => {
      return await this.bookmarkManager.deleteBookmark(id);
    });

    // History management
    ipcMain.handle('history:add', async (event, historyItem) => {
      return await this.historyManager.addHistoryItem(historyItem);
    });

    ipcMain.handle('history:getAll', async () => {
      return await this.historyManager.getAllHistory();
    });

    ipcMain.handle('history:search', async (event, query) => {
      return await this.historyManager.searchHistory(query);
    });

    ipcMain.handle('history:clear', async () => {
      return await this.historyManager.clearHistory();
    });

    // Download management
    ipcMain.handle('downloads:start', async (event, downloadInfo) => {
      return await this.downloadManager.startDownload(downloadInfo);
    });

    ipcMain.handle('downloads:pause', async (event, downloadId) => {
      return await this.downloadManager.pauseDownload(downloadId);
    });

    ipcMain.handle('downloads:resume', async (event, downloadId) => {
      return await this.downloadManager.resumeDownload(downloadId);
    });

    ipcMain.handle('downloads:cancel', async (event, downloadId) => {
      return await this.downloadManager.cancelDownload(downloadId);
    });

    ipcMain.handle('downloads:getAll', async () => {
      return await this.downloadManager.getAllDownloads();
    });

    // Settings
    ipcMain.handle('settings:get', async (event, key) => {
      return this.store.get(key);
    });

    ipcMain.handle('settings:set', async (event, key, value) => {
      this.store.set(key, value);
      return true;
    });

    // Security
    ipcMain.handle('security:validateUrl', async (event, url) => {
      return this.securityManager.validateUrl(url);
    });

    // Extension management
    ipcMain.handle('extensions:install', async (event, extensionPath) => {
      return await this.extensionManager.installExtension(extensionPath);
    });

    ipcMain.handle('extensions:getAll', async () => {
      return await this.extensionManager.getAllExtensions();
    });

    ipcMain.handle('extensions:enable', async (event, extensionId) => {
      return await this.extensionManager.enableExtension(extensionId);
    });

    ipcMain.handle('extensions:disable', async (event, extensionId) => {
      return await this.extensionManager.disableExtension(extensionId);
    });
  }

  setupMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Tab',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              this.tabManager.createTab('about:blank');
            }
          },
          {
            label: 'New Window',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.createMainWindow();
            }
          },
          { type: 'separator' },
          {
            label: 'Import Bookmarks',
            click: async () => {
              const result = await dialog.showOpenDialog(this.mainWindow, {
                properties: ['openFile'],
                filters: [
                  { name: 'HTML Files', extensions: ['html'] },
                  { name: 'JSON Files', extensions: ['json'] }
                ]
              });
              
              if (!result.canceled) {
                await this.bookmarkManager.importBookmarks(result.filePaths[0]);
              }
            }
          },
          {
            label: 'Export Bookmarks',
            click: async () => {
              const result = await dialog.showSaveDialog(this.mainWindow, {
                defaultPath: 'bookmarks.html',
                filters: [
                  { name: 'HTML Files', extensions: ['html'] }
                ]
              });
              
              if (!result.canceled) {
                await this.bookmarkManager.exportBookmarks(result.filePath);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Carbonate Browser',
            click: () => {
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'About Carbonate Browser',
                message: 'Carbonate Browser v1.0.0',
                detail: 'A modern desktop browser built with Electron'
              });
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupTray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));
    this.tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Browser',
        click: () => {
          this.mainWindow.show();
        }
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Carbonate Browser');
  }

  setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. It will be downloaded in the background.',
        buttons: ['OK']
      });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will restart to apply the update.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  cleanup() {
    this.database.close();
    this.tabManager.cleanup();
    this.downloadManager.cleanup();
  }
}

// Initialize the browser
new CarbonateBrowser();
