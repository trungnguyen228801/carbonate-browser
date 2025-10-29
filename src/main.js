const { app, BrowserWindow, Menu, shell, ipcMain, dialog, autoUpdater } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { importBookmarks, importSettings } = require('./utils/browserImport');
const { setupAutoLaunch } = require('./utils/autoLaunch');
const { setupSearchAutocomplete } = require('./utils/searchAutocomplete');

// Initialize store for settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the main page
  mainWindow.loadFile('src/renderer/index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check if first run and offer to import bookmarks/settings
    if (!store.get('hasImportedData', false)) {
      showImportDialog();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Setup search autocomplete
  setupSearchAutocomplete(mainWindow);

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('new-tab');
          }
        },
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Import Bookmarks',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'HTML Files', extensions: ['html'] },
                { name: 'JSON Files', extensions: ['json'] }
              ]
            });
            
            if (!result.canceled) {
              try {
                await importBookmarks(result.filePaths[0]);
                mainWindow.webContents.send('bookmarks-imported');
              } catch (error) {
                dialog.showErrorBox('Import Error', 'Failed to import bookmarks: ' + error.message);
              }
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
        { role: 'paste' }
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
      label: 'Bookmarks',
      submenu: [
        {
          label: 'Bookmark Manager',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            mainWindow.webContents.send('open-bookmark-manager');
          }
        },
        {
          label: 'Add Bookmark',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('add-bookmark');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Built-in Apps',
          click: () => {
            mainWindow.webContents.send('open-apps');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Carbonate Browser',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Carbonate Browser',
              message: 'Carbonate Browser v1.0.0',
              detail: 'A fast, lightweight Chromium-based browser with built-in apps and curated content.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function showImportDialog() {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Import Now', 'Skip', 'Never Ask'],
    defaultId: 0,
    title: 'Welcome to Carbonate Browser',
    message: 'Import your existing browser data?',
    detail: 'We can help you transfer your bookmarks and settings from your current browser to get started quickly.'
  });

  if (result.response === 0) {
    // Import now
    const fileResult = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'HTML Files', extensions: ['html'] },
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    if (!fileResult.canceled) {
      try {
        await importBookmarks(fileResult.filePaths[0]);
        store.set('hasImportedData', true);
        mainWindow.webContents.send('bookmarks-imported');
      } catch (error) {
        dialog.showErrorBox('Import Error', 'Failed to import bookmarks: ' + error.message);
      }
    }
  } else if (result.response === 2) {
    // Never ask
    store.set('hasImportedData', true);
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  // Setup auto-launch on system start
  setupAutoLaunch();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('get-bookmarks', () => {
  return store.get('bookmarks', []);
});

ipcMain.handle('add-bookmark', (event, bookmark) => {
  const bookmarks = store.get('bookmarks', []);
  bookmarks.push(bookmark);
  store.set('bookmarks', bookmarks);
});

ipcMain.handle('remove-bookmark', (event, bookmarkId) => {
  const bookmarks = store.get('bookmarks', []);
  const filtered = bookmarks.filter(b => b.id !== bookmarkId);
  store.set('bookmarks', filtered);
});

ipcMain.handle('search-suggestions', async (event, query) => {
  // This would typically call a search API
  // For now, return mock suggestions
  const suggestions = [
    `${query} news`,
    `${query} weather`,
    `${query} wikipedia`,
    `${query} youtube`,
    `${query} shopping`
  ];
  return suggestions.slice(0, 5);
});

