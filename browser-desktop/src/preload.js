const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Tab management
  createTab: (url) => ipcRenderer.invoke('tabs:create', url),
  closeTab: (tabId) => ipcRenderer.invoke('tabs:close', tabId),
  getAllTabs: () => ipcRenderer.invoke('tabs:getAll'),
  switchTab: (tabId) => ipcRenderer.invoke('tabs:switch', tabId),

  // Bookmark management
  addBookmark: (bookmark) => ipcRenderer.invoke('bookmarks:add', bookmark),
  getAllBookmarks: () => ipcRenderer.invoke('bookmarks:getAll'),
  updateBookmark: (id, bookmark) => ipcRenderer.invoke('bookmarks:update', id, bookmark),
  deleteBookmark: (id) => ipcRenderer.invoke('bookmarks:delete', id),

  // History management
  addHistoryItem: (historyItem) => ipcRenderer.invoke('history:add', historyItem),
  getAllHistory: () => ipcRenderer.invoke('history:getAll'),
  searchHistory: (query) => ipcRenderer.invoke('history:search', query),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  // Download management
  startDownload: (downloadInfo) => ipcRenderer.invoke('downloads:start', downloadInfo),
  pauseDownload: (downloadId) => ipcRenderer.invoke('downloads:pause', downloadId),
  resumeDownload: (downloadId) => ipcRenderer.invoke('downloads:resume', downloadId),
  cancelDownload: (downloadId) => ipcRenderer.invoke('downloads:cancel', downloadId),
  getAllDownloads: () => ipcRenderer.invoke('downloads:getAll'),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),

  // Security
  validateUrl: (url) => ipcRenderer.invoke('security:validateUrl', url),

  // Extensions
  installExtension: (extensionPath) => ipcRenderer.invoke('extensions:install', extensionPath),
  getAllExtensions: () => ipcRenderer.invoke('extensions:getAll'),
  enableExtension: (extensionId) => ipcRenderer.invoke('extensions:enable', extensionId),
  disableExtension: (extensionId) => ipcRenderer.invoke('extensions:disable', extensionId),

  // Event listeners
  onTabCreated: (callback) => ipcRenderer.on('tab:created', callback),
  onTabClosed: (callback) => ipcRenderer.on('tab:closed', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download:progress', callback),
  onDownloadComplete: (callback) => ipcRenderer.on('download:complete', callback),
  onBookmarkAdded: (callback) => ipcRenderer.on('bookmark:added', callback),
  onHistoryAdded: (callback) => ipcRenderer.on('history:added', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
