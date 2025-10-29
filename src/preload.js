const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (bookmark) => ipcRenderer.invoke('add-bookmark', bookmark),
  removeBookmark: (bookmarkId) => ipcRenderer.invoke('remove-bookmark', bookmarkId),
  
  // Search
  getSearchSuggestions: (query) => ipcRenderer.invoke('search-suggestions', query),
  
  // Events
  onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
  onBookmarksImported: (callback) => ipcRenderer.on('bookmarks-imported', callback),
  onOpenBookmarkManager: (callback) => ipcRenderer.on('open-bookmark-manager', callback),
  onAddBookmark: (callback) => ipcRenderer.on('add-bookmark', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onOpenApps: (callback) => ipcRenderer.on('open-apps', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

