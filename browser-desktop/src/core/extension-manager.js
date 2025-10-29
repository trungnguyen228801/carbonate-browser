const fs = require('fs');
const path = require('path');

class ExtensionManager {
  constructor() {
    this.extensions = new Map();
    this.extensionsPath = path.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config'), 'carbonate-browser', 'extensions');
  }

  async installExtension(extensionPath) {
    try {
      // Read manifest
      const manifestPath = path.join(extensionPath, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error('manifest.json not found');
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Validate manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid manifest');
      }

      const extensionId = this.generateExtensionId(manifest);
      const extension = {
        id: extensionId,
        name: manifest.name,
        version: manifest.version,
        enabled: true,
        manifest: manifest,
        path: extensionPath,
        installedAt: new Date().toISOString()
      };

      this.extensions.set(extensionId, extension);
      
      // Load extension
      await this.loadExtension(extension);
      
      return { success: true, extensionId };
    } catch (error) {
      console.error('Failed to install extension:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllExtensions() {
    return Array.from(this.extensions.values());
  }

  async enableExtension(extensionId) {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      return { success: false, error: 'Extension not found' };
    }

    extension.enabled = true;
    await this.loadExtension(extension);
    
    return { success: true };
  }

  async disableExtension(extensionId) {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      return { success: false, error: 'Extension not found' };
    }

    extension.enabled = false;
    await this.unloadExtension(extension);
    
    return { success: true };
  }

  async loadExtension(extension) {
    if (!extension.enabled) return;

    try {
      // Load background script if exists
      if (extension.manifest.background && extension.manifest.background.scripts) {
        for (const script of extension.manifest.background.scripts) {
          const scriptPath = path.join(extension.path, script);
          if (fs.existsSync(scriptPath)) {
            // In a real implementation, you would load this in a separate context
            console.log(`Loading background script: ${scriptPath}`);
          }
        }
      }

      // Load content scripts
      if (extension.manifest.content_scripts) {
        for (const contentScript of extension.manifest.content_scripts) {
          console.log(`Content script registered for: ${contentScript.matches.join(', ')}`);
        }
      }

      console.log(`Extension ${extension.name} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load extension ${extension.name}:`, error);
    }
  }

  async unloadExtension(extension) {
    try {
      // Unload background script
      if (extension.manifest.background) {
        console.log(`Unloading background script for ${extension.name}`);
      }

      // Unload content scripts
      if (extension.manifest.content_scripts) {
        console.log(`Unloading content scripts for ${extension.name}`);
      }

      console.log(`Extension ${extension.name} unloaded successfully`);
    } catch (error) {
      console.error(`Failed to unload extension ${extension.name}:`, error);
    }
  }

  validateManifest(manifest) {
    // Basic manifest validation
    const requiredFields = ['name', 'version', 'manifest_version'];
    
    for (const field of requiredFields) {
      if (!manifest[field]) {
        return false;
      }
    }

    // Check manifest version
    if (manifest.manifest_version !== 2) {
      return false;
    }

    // Check permissions
    if (manifest.permissions) {
      const allowedPermissions = [
        'activeTab',
        'tabs',
        'bookmarks',
        'history',
        'downloads',
        'storage',
        'notifications'
      ];

      for (const permission of manifest.permissions) {
        if (!allowedPermissions.includes(permission)) {
          return false;
        }
      }
    }

    return true;
  }

  generateExtensionId(manifest) {
    // Simple ID generation based on name and version
    const name = manifest.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const version = manifest.version.replace(/\./g, '');
    return `${name}@${version}`;
  }

  async executeContentScript(extensionId, tabId, url) {
    const extension = this.extensions.get(extensionId);
    if (!extension || !extension.enabled) return;

    if (extension.manifest.content_scripts) {
      for (const contentScript of extension.manifest.content_scripts) {
        // Check if URL matches
        const matches = contentScript.matches || [];
        const urlMatches = matches.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(url);
        });

        if (urlMatches) {
          // In a real implementation, you would inject the script into the tab
          console.log(`Executing content script for ${extension.name} on tab ${tabId}`);
        }
      }
    }
  }

  async sendMessage(extensionId, message) {
    const extension = this.extensions.get(extensionId);
    if (!extension || !extension.enabled) return;

    // In a real implementation, you would send this to the extension's background script
    console.log(`Sending message to extension ${extension.name}:`, message);
  }

  async getExtensionAPI(extensionId) {
    const extension = this.extensions.get(extensionId);
    if (!extension) return null;

    // Return a subset of Chrome extension APIs
    return {
      tabs: {
        query: (queryInfo) => this.queryTabs(queryInfo),
        create: (createProperties) => this.createTab(createProperties),
        update: (tabId, updateProperties) => this.updateTab(tabId, updateProperties),
        remove: (tabId) => this.removeTab(tabId)
      },
      bookmarks: {
        get: (callback) => this.getBookmarks(callback),
        create: (bookmark) => this.createBookmark(bookmark),
        update: (id, changes) => this.updateBookmark(id, changes),
        remove: (id) => this.removeBookmark(id)
      },
      storage: {
        local: {
          get: (keys) => this.getStorage(keys),
          set: (items) => this.setStorage(items),
          remove: (keys) => this.removeStorage(keys),
          clear: () => this.clearStorage()
        }
      }
    };
  }

  // Extension API implementations (simplified)
  async queryTabs(queryInfo) {
    // Return mock tab data
    return [{
      id: 1,
      url: 'https://example.com',
      title: 'Example',
      active: true
    }];
  }

  async createTab(createProperties) {
    // Create new tab
    return { id: Date.now() };
  }

  async updateTab(tabId, updateProperties) {
    // Update tab
    return { success: true };
  }

  async removeTab(tabId) {
    // Remove tab
    return { success: true };
  }

  async getBookmarks(callback) {
    // Get bookmarks and call callback
    if (callback) {
      callback([]);
    }
  }

  async createBookmark(bookmark) {
    // Create bookmark
    return { success: true };
  }

  async updateBookmark(id, changes) {
    // Update bookmark
    return { success: true };
  }

  async removeBookmark(id) {
    // Remove bookmark
    return { success: true };
  }

  async getStorage(keys) {
    // Get storage data
    return {};
  }

  async setStorage(items) {
    // Set storage data
    return { success: true };
  }

  async removeStorage(keys) {
    // Remove storage data
    return { success: true };
  }

  async clearStorage() {
    // Clear storage
    return { success: true };
  }
}

module.exports = ExtensionManager;
