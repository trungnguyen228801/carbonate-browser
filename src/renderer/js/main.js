// Main Browser Application
class CarbonateBrowser {
    constructor() {
        this.currentTabId = 1;
        this.tabs = new Map();
        this.settings = {};
        this.bookmarks = [];
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadBookmarks();
        this.setupEventListeners();
        this.setupElectronEvents();
        this.renderNewTabPage();
    }

    async loadSettings() {
        try {
            this.settings = await window.electronAPI.getSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = {
                searchEngine: 'yahoo',
                autoLaunch: false,
                showBookmarks: true
            };
        }
    }

    async loadBookmarks() {
        try {
            this.bookmarks = await window.electronAPI.getBookmarks();
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            this.bookmarks = [];
        }
    }

    setupEventListeners() {
        // Navigation controls
        document.getElementById('backBtn').addEventListener('click', () => this.goBack());
        document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());

        // Address bar
        const addressInput = document.getElementById('addressInput');
        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigateToUrl(addressInput.value);
            }
        });

        // New tab search
        const newTabSearch = document.getElementById('newTabSearch');
        newTabSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigateToUrl(newTabSearch.value);
            }
        });

        document.getElementById('newTabSearchBtn').addEventListener('click', () => {
            this.navigateToUrl(newTabSearch.value);
        });

        // Action buttons
        document.getElementById('bookmarkBtn').addEventListener('click', () => this.showBookmarkModal());
        document.getElementById('appsBtn').addEventListener('click', () => this.showAppsModal());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());

        // New tab button
        document.getElementById('newTabBtn').addEventListener('click', () => this.createNewTab());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Bookmark form
        document.getElementById('bookmarkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBookmark();
        });

        document.getElementById('cancelBookmark').addEventListener('click', () => {
            this.hideModal('bookmarkModal');
        });

        // Settings form
        this.setupSettingsForm();
    }

    setupElectronEvents() {
        // Listen for Electron events
        window.electronAPI.onNewTab(() => this.createNewTab());
        window.electronAPI.onBookmarksImported(() => this.onBookmarksImported());
        window.electronAPI.onOpenBookmarkManager(() => this.showBookmarkManager());
        window.electronAPI.onAddBookmark(() => this.showBookmarkModal());
        window.electronAPI.onOpenSettings(() => this.showSettingsModal());
        window.electronAPI.onOpenApps(() => this.showAppsModal());

        // Listen for messages from iframe (search results)
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'navigate') {
                this.navigateToUrl(event.data.url, true); // Create new tab for search results
            }
        });
    }

    setupSettingsForm() {
        const autoLaunchCheckbox = document.getElementById('autoLaunch');
        const showBookmarksCheckbox = document.getElementById('showBookmarks');
        const searchEngineSelect = document.getElementById('searchEngine');

        // Load current settings
        autoLaunchCheckbox.checked = this.settings.autoLaunch || false;
        showBookmarksCheckbox.checked = this.settings.showBookmarks !== false;
        searchEngineSelect.value = this.settings.searchEngine || 'yahoo';

        // Save settings on change
        autoLaunchCheckbox.addEventListener('change', async (e) => {
            await window.electronAPI.setSetting('autoLaunch', e.target.checked);
            this.settings.autoLaunch = e.target.checked;
        });

        showBookmarksCheckbox.addEventListener('change', async (e) => {
            await window.electronAPI.setSetting('showBookmarks', e.target.checked);
            this.settings.showBookmarks = e.target.checked;
            this.renderNewTabPage();
        });

        searchEngineSelect.addEventListener('change', async (e) => {
            await window.electronAPI.setSetting('searchEngine', e.target.value);
            this.settings.searchEngine = e.target.value;
        });
    }

    navigateToUrl(url, createNewTab = false) {
        if (!url) return;

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
            // Check if it looks like a domain
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                // Treat as search query
                url = this.getSearchUrl(url);
            }
        }

        // Update address bar
        document.getElementById('addressInput').value = url;
        
        // If createNewTab is true or we're coming from search results, create new tab
        if (createNewTab || this.isSearchUrl(url)) {
            this.createNewTab();
            // Wait a bit for the new tab to be created, then load URL
            setTimeout(() => {
                this.loadUrlInCurrentTab(url);
            }, 100);
        } else {
            // Load the URL in the current tab
            this.loadUrlInCurrentTab(url);
        }
    }

    getSearchUrl(query) {
        const searchEngines = {
            yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`,
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        return searchEngines[this.settings.searchEngine] || searchEngines.yahoo;
    }

    loadUrlInCurrentTab(url) {
        const currentTab = document.querySelector('.tab.active');
        if (!currentTab) return;

        const tabId = currentTab.getAttribute('data-tab-id');
        const tabContent = document.getElementById(`tab-${tabId}`);
        
        if (!tabContent) return;

        // Check if it's a search URL
        if (this.isSearchUrl(url)) {
            this.loadSearchResults(url, tabContent, currentTab);
        } else {
            this.loadWebPage(url, tabContent, currentTab);
        }
    }

    isSearchUrl(url) {
        return url.includes('search.yahoo.com') || 
               url.includes('google.com/search') || 
               url.includes('bing.com/search');
    }

    loadSearchResults(url, tabContent, currentTab) {
        // Extract search query from URL
        const query = this.extractSearchQuery(url);
        
        // Update tab title
        const tabTitle = currentTab.querySelector('.tab-title');
        if (tabTitle) {
            tabTitle.textContent = `Tìm kiếm: ${query}`;
        }

        // Load custom search results page
        tabContent.innerHTML = `
            <div class="browser-content">
                <iframe src="search-results.html?q=${encodeURIComponent(query)}" 
                        style="width: 100%; height: 100%; border: none;">
                </iframe>
            </div>
        `;

        this.showToast('Tìm kiếm: ' + query, 'success');
    }

    loadWebPage(url, tabContent, currentTab) {
        // Update tab title
        const tabTitle = currentTab.querySelector('.tab-title');
        if (tabTitle) {
            tabTitle.textContent = this.extractDomain(url) || 'Loading...';
        }

        // Create iframe to load the URL
        tabContent.innerHTML = `
            <div class="browser-content">
                <iframe src="${url}" 
                        style="width: 100%; height: 100%; border: none;"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
                </iframe>
            </div>
        `;

        this.showToast('Loading: ' + url, 'success');
    }

    extractSearchQuery(url) {
        try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
            return params.get('p') || params.get('q') || 'tìm kiếm';
        } catch (e) {
            return 'tìm kiếm';
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return url;
        }
    }

    goBack() {
        this.showToast('Back navigation', 'success');
    }

    goForward() {
        this.showToast('Forward navigation', 'success');
    }

    refresh() {
        this.showToast('Page refreshed', 'success');
    }

    createNewTab() {
        const newTabId = ++this.currentTabId;
        const tabsContainer = document.getElementById('tabsContainer');
        
        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.setAttribute('data-tab-id', newTabId);
        tabElement.innerHTML = `
            <span class="tab-title">New Tab</span>
            <button class="tab-close" data-tab-id="${newTabId}">×</button>
        `;

        // Add click handlers
        tabElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.switchTab(newTabId);
            }
        });

        tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(newTabId);
        });

        tabsContainer.appendChild(tabElement);

        // Create tab content
        const contentElement = document.createElement('div');
        contentElement.className = 'tab-content';
        contentElement.id = `tab-${newTabId}`;
        contentElement.innerHTML = `
            <div class="new-tab-page">
                <div class="logo">
                    <h1>Carbonate Browser</h1>
                    <p>Fast, lightweight browsing with built-in apps</p>
                </div>
                <div class="search-container">
                    <div class="search-box">
                        <input type="text" placeholder="Search with Yahoo or enter address" autocomplete="off">
                        <button>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.querySelector('.content-area').appendChild(contentElement);

        // Switch to new tab
        this.switchTab(newTabId);
    }

    switchTab(tabId) {
        // Update tab appearance
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab-id="${tabId}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}`).classList.add('active');
    }

    closeTab(tabId) {
        if (document.querySelectorAll('.tab').length <= 1) {
            this.showToast('Cannot close the last tab', 'error');
            return;
        }

        // Remove tab element
        document.querySelector(`[data-tab-id="${tabId}"]`).remove();
        
        // Remove content
        document.getElementById(`tab-${tabId}`).remove();

        // Switch to first available tab
        const firstTab = document.querySelector('.tab');
        if (firstTab) {
            const firstTabId = firstTab.getAttribute('data-tab-id');
            this.switchTab(firstTabId);
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    showBookmarkModal() {
        this.showModal('bookmarkModal');
    }

    showSettingsModal() {
        this.showModal('settingsModal');
    }

    showAppsModal() {
        this.showModal('appsModal');
        this.renderAppsModal();
    }

    async addBookmark() {
        const title = document.getElementById('bookmarkTitle').value;
        const url = document.getElementById('bookmarkUrl').value;

        if (!title || !url) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        const bookmark = {
            id: Date.now(),
            title,
            url,
            dateAdded: new Date().toISOString()
        };

        try {
            await window.electronAPI.addBookmark(bookmark);
            this.bookmarks.push(bookmark);
            this.hideModal('bookmarkModal');
            this.showToast('Bookmark added successfully', 'success');
            this.renderNewTabPage();
        } catch (error) {
            this.showToast('Failed to add bookmark', 'error');
        }
    }

    renderNewTabPage() {
        this.renderQuickApps();
        if (this.settings.showBookmarks !== false) {
            this.renderBookmarks();
        }
    }

    renderQuickApps() {
        const appsGrid = document.getElementById('appsGrid');
        const apps = [
            { name: 'Calculator', icon: '🧮', url: 'calculator://' },
            { name: 'Notes', icon: '📝', url: 'notes://' },
            { name: 'Weather', icon: '🌤️', url: 'weather://' },
            { name: 'News', icon: '📰', url: 'news://' },
            { name: 'Calendar', icon: '📅', url: 'calendar://' },
            { name: 'Files', icon: '📁', url: 'files://' }
        ];

        appsGrid.innerHTML = apps.map(app => `
            <div class="app-item" onclick="browser.openApp('${app.url}')">
                <div class="app-icon">${app.icon}</div>
                <div class="app-name">${app.name}</div>
            </div>
        `).join('');
    }

    renderBookmarks() {
        const bookmarksGrid = document.getElementById('bookmarksGrid');
        
        if (this.bookmarks.length === 0) {
            bookmarksGrid.innerHTML = '<p style="text-align: center; opacity: 0.7;">No bookmarks yet. Add some to see them here!</p>';
            return;
        }

        bookmarksGrid.innerHTML = this.bookmarks.slice(0, 8).map(bookmark => `
            <div class="bookmark-item" onclick="browser.navigateToUrl('${bookmark.url}')">
                <div class="bookmark-icon">🌐</div>
                <div class="bookmark-name">${bookmark.title}</div>
            </div>
        `).join('');
    }

    renderAppsModal() {
        const appsGridLarge = document.getElementById('appsGridLarge');
        const apps = [
            { name: 'Calculator', icon: '🧮', description: 'Basic calculator app' },
            { name: 'Notes', icon: '📝', description: 'Take quick notes' },
            { name: 'Weather', icon: '🌤️', description: 'Check weather forecast' },
            { name: 'News', icon: '📰', description: 'Latest news updates' },
            { name: 'Calendar', icon: '📅', description: 'Calendar and events' },
            { name: 'Files', icon: '📁', description: 'File manager' },
            { name: 'Settings', icon: '⚙️', description: 'Browser settings' },
            { name: 'Help', icon: '❓', description: 'Help and support' }
        ];

        appsGridLarge.innerHTML = apps.map(app => `
            <div class="app-item-large" onclick="browser.openApp('${app.name.toLowerCase()}://')">
                <div class="app-icon-large">${app.icon}</div>
                <div class="app-name-large">${app.name}</div>
            </div>
        `).join('');
    }

    openApp(appUrl) {
        this.showToast(`Opening ${appUrl}`, 'success');
        // Here you would implement actual app functionality
    }

    onBookmarksImported() {
        this.loadBookmarks().then(() => {
            this.renderNewTabPage();
            this.showToast('Bookmarks imported successfully', 'success');
        });
    }

    showBookmarkManager() {
        this.showToast('Bookmark Manager - Coming Soon', 'success');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the browser when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.browser = new CarbonateBrowser();
});

