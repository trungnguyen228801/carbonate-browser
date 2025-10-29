const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class TabManager {
  constructor() {
    this.tabs = new Map();
    this.activeTabId = null;
    this.nextTabId = 1;
  }

  async createTab(url = 'about:blank') {
    const tabId = this.nextTabId++;
    
    const tab = {
      id: tabId,
      url: url,
      title: 'New Tab',
      favicon: '',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isIncognito: false,
      webContents: null
    };

    this.tabs.set(tabId, tab);
    
    if (this.activeTabId) {
      this.activeTabId = tabId;
    } else {
      this.activeTabId = tabId;
    }

    // Notify renderer about new tab
    this.notifyTabCreated(tab);
    
    return tab;
  }

  async closeTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return false;

    // If this is the last tab, create a new one
    if (this.tabs.size === 1) {
      await this.createTab();
    }

    // If this was the active tab, switch to another tab
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys()).filter(id => id !== tabId);
      if (remainingTabs.length > 0) {
        this.activeTabId = remainingTabs[0];
      }
    }

    this.tabs.delete(tabId);
    
    // Notify renderer about tab closure
    this.notifyTabClosed(tabId);
    
    return true;
  }

  async switchTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return false;

    this.activeTabId = tabId;
    
    // Notify renderer about tab switch
    this.notifyTabSwitched(tabId);
    
    return true;
  }

  async getAllTabs() {
    return Array.from(this.tabs.values());
  }

  async getActiveTab() {
    return this.tabs.get(this.activeTabId);
  }

  async updateTab(tabId, updates) {
    const tab = this.tabs.get(tabId);
    if (!tab) return false;

    Object.assign(tab, updates);
    this.tabs.set(tabId, tab);
    
    // Notify renderer about tab update
    this.notifyTabUpdated(tab);
    
    return true;
  }

  async navigateToUrl(tabId, url) {
    const tab = this.tabs.get(tabId);
    if (!tab) return false;

    // Validate URL
    if (!this.isValidUrl(url)) {
      // Treat as search query
      url = this.getSearchUrl(url);
    }

    await this.updateTab(tabId, {
      url: url,
      isLoading: true
    });

    // In a real implementation, you would load the URL in the webContents
    // For now, we'll simulate navigation
    setTimeout(() => {
      this.updateTab(tabId, {
        title: this.extractTitleFromUrl(url),
        isLoading: false
      });
    }, 1000);

    return true;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  getSearchUrl(query) {
    // Default to Google search
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return 'New Tab';
    }
  }

  notifyTabCreated(tab) {
    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('tab:created', tab);
    });
  }

  notifyTabClosed(tabId) {
    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('tab:closed', tabId);
    });
  }

  notifyTabSwitched(tabId) {
    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('tab:switched', tabId);
    });
  }

  notifyTabUpdated(tab) {
    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('tab:updated', tab);
    });
  }

  cleanup() {
    this.tabs.clear();
  }
}

module.exports = TabManager;
