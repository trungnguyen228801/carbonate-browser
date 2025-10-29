const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Import bookmarks from various browser formats
 */
async function importBookmarks(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const extension = path.extname(filePath).toLowerCase();
        
        let bookmarks = [];
        
        if (extension === '.html') {
            bookmarks = parseHTMLBookmarks(content);
        } else if (extension === '.json') {
            bookmarks = parseJSONBookmarks(content);
        } else {
            throw new Error('Unsupported file format. Please use HTML or JSON files.');
        }
        
        return bookmarks;
    } catch (error) {
        throw new Error(`Failed to import bookmarks: ${error.message}`);
    }
}

/**
 * Parse HTML bookmarks file (Chrome, Firefox, etc.)
 */
function parseHTMLBookmarks(htmlContent) {
    const bookmarks = [];
    const linkRegex = /<A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
    let match;
    
    while ((match = linkRegex.exec(htmlContent)) !== null) {
        const url = match[1];
        const title = match[2].trim();
        
        if (url && title && isValidUrl(url)) {
            bookmarks.push({
                id: Date.now() + Math.random(),
                title: title,
                url: url,
                dateAdded: new Date().toISOString(),
                imported: true
            });
        }
    }
    
    return bookmarks;
}

/**
 * Parse JSON bookmarks file
 */
function parseJSONBookmarks(jsonContent) {
    try {
        const data = JSON.parse(jsonContent);
        const bookmarks = [];
        
        // Handle different JSON bookmark formats
        if (Array.isArray(data)) {
            // Simple array format
            data.forEach(item => {
                if (item.url && item.title) {
                    bookmarks.push({
                        id: item.id || Date.now() + Math.random(),
                        title: item.title,
                        url: item.url,
                        dateAdded: item.dateAdded || new Date().toISOString(),
                        imported: true
                    });
                }
            });
        } else if (data.roots) {
            // Chrome bookmarks format
            extractBookmarksFromChrome(data.roots, bookmarks);
        } else if (data.children) {
            // Firefox bookmarks format
            extractBookmarksFromFirefox(data.children, bookmarks);
        }
        
        return bookmarks;
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
}

/**
 * Extract bookmarks from Chrome bookmarks structure
 */
function extractBookmarksFromChrome(roots, bookmarks) {
    Object.values(roots).forEach(folder => {
        if (folder.children) {
            extractBookmarksRecursive(folder.children, bookmarks);
        }
    });
}

/**
 * Extract bookmarks from Firefox bookmarks structure
 */
function extractBookmarksFromFirefox(children, bookmarks) {
    extractBookmarksRecursive(children, bookmarks);
}

/**
 * Recursively extract bookmarks from nested structure
 */
function extractBookmarksRecursive(items, bookmarks) {
    items.forEach(item => {
        if (item.type === 'url' && item.url && item.title) {
            bookmarks.push({
                id: item.id || Date.now() + Math.random(),
                title: item.title,
                url: item.url,
                dateAdded: item.dateAdded || new Date().toISOString(),
                imported: true
            });
        } else if (item.children) {
            extractBookmarksRecursive(item.children, bookmarks);
        }
    });
}

/**
 * Import settings from existing browsers
 */
async function importSettings() {
    const settings = {
        searchEngine: 'yahoo',
        autoLaunch: false,
        showBookmarks: true,
        homepage: 'https://search.yahoo.com',
        defaultZoom: 100
    };
    
    try {
        // Try to detect and import from Chrome
        const chromeSettings = await detectChromeSettings();
        if (chromeSettings) {
            settings.searchEngine = chromeSettings.searchEngine || 'yahoo';
            settings.homepage = chromeSettings.homepage || 'https://search.yahoo.com';
        }
        
        // Try to detect and import from Firefox
        const firefoxSettings = await detectFirefoxSettings();
        if (firefoxSettings) {
            settings.searchEngine = firefoxSettings.searchEngine || 'yahoo';
            settings.homepage = firefoxSettings.homepage || 'https://search.yahoo.com';
        }
        
        return settings;
    } catch (error) {
        console.error('Failed to import settings:', error);
        return settings;
    }
}

/**
 * Detect Chrome settings
 */
async function detectChromeSettings() {
    try {
        const userDataPath = getChromeUserDataPath();
        const preferencesPath = path.join(userDataPath, 'Default', 'Preferences');
        
        const content = await fs.readFile(preferencesPath, 'utf8');
        const prefs = JSON.parse(content);
        
        const settings = {};
        
        // Extract search engine
        if (prefs.default_search_provider_data && prefs.default_search_provider_data.template_url_data) {
            const searchProvider = prefs.default_search_provider_data.template_url_data[0];
            if (searchProvider) {
                const url = searchProvider.url;
                if (url.includes('google.com')) {
                    settings.searchEngine = 'google';
                } else if (url.includes('bing.com')) {
                    settings.searchEngine = 'bing';
                } else if (url.includes('yahoo.com')) {
                    settings.searchEngine = 'yahoo';
                }
            }
        }
        
        // Extract homepage
        if (prefs.homepage) {
            settings.homepage = prefs.homepage;
        }
        
        return settings;
    } catch (error) {
        return null;
    }
}

/**
 * Detect Firefox settings
 */
async function detectFirefoxSettings() {
    try {
        const firefoxProfilePath = getFirefoxProfilePath();
        const prefsPath = path.join(firefoxProfilePath, 'prefs.js');
        
        const content = await fs.readFile(prefsPath, 'utf8');
        const settings = {};
        
        // Extract search engine
        const searchEngineMatch = content.match(/user_pref\("browser\.search\.defaultenginename", "([^"]+)"\)/);
        if (searchEngineMatch) {
            const engine = searchEngineMatch[1];
            if (engine.includes('Google')) {
                settings.searchEngine = 'google';
            } else if (engine.includes('Bing')) {
                settings.searchEngine = 'bing';
            } else if (engine.includes('Yahoo')) {
                settings.searchEngine = 'yahoo';
            }
        }
        
        // Extract homepage
        const homepageMatch = content.match(/user_pref\("browser\.startup\.homepage", "([^"]+)"\)/);
        if (homepageMatch) {
            settings.homepage = homepageMatch[1];
        }
        
        return settings;
    } catch (error) {
        return null;
    }
}

/**
 * Get Chrome user data path
 */
function getChromeUserDataPath() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    switch (platform) {
        case 'win32':
            return path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
        case 'darwin':
            return path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome');
        case 'linux':
            return path.join(homeDir, '.config', 'google-chrome');
        default:
            return null;
    }
}

/**
 * Get Firefox profile path
 */
function getFirefoxProfilePath() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    switch (platform) {
        case 'win32':
            return path.join(homeDir, 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles');
        case 'darwin':
            return path.join(homeDir, 'Library', 'Application Support', 'Firefox', 'Profiles');
        case 'linux':
            return path.join(homeDir, '.mozilla', 'firefox');
        default:
            return null;
    }
}

/**
 * Validate URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Auto-detect and import from common browser locations
 */
async function autoDetectAndImport() {
    const results = {
        bookmarks: [],
        settings: null
    };
    
    try {
        // Try to import bookmarks from Chrome
        const chromeBookmarksPath = path.join(getChromeUserDataPath(), 'Default', 'Bookmarks');
        try {
            const chromeBookmarks = await importBookmarks(chromeBookmarksPath);
            results.bookmarks = results.bookmarks.concat(chromeBookmarks);
        } catch (error) {
            console.log('Chrome bookmarks not found or accessible');
        }
        
        // Try to import bookmarks from Firefox
        const firefoxBookmarksPath = path.join(getFirefoxProfilePath(), 'bookmarks.html');
        try {
            const firefoxBookmarks = await importBookmarks(firefoxBookmarksPath);
            results.bookmarks = results.bookmarks.concat(firefoxBookmarks);
        } catch (error) {
            console.log('Firefox bookmarks not found or accessible');
        }
        
        // Import settings
        results.settings = await importSettings();
        
        return results;
    } catch (error) {
        throw new Error(`Auto-detection failed: ${error.message}`);
    }
}

module.exports = {
    importBookmarks,
    importSettings,
    autoDetectAndImport
};

