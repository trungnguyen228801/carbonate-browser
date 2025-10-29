// Tab Management System
class TabManager {
    constructor() {
        this.tabs = new Map();
        this.activeTabId = 1;
        this.nextTabId = 2;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createInitialTab();
    }

    setupEventListeners() {
        // New tab button
        const newTabBtn = document.getElementById('newTabBtn');
        if (newTabBtn) {
            newTabBtn.addEventListener('click', () => this.createNewTab());
        }

        // Tab close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) {
                const tabId = parseInt(e.target.dataset.tabId);
                this.closeTab(tabId);
            }
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tab') && !e.target.classList.contains('tab-close')) {
                const tabElement = e.target.closest('.tab');
                const tabId = parseInt(tabElement.dataset.tabId);
                this.switchToTab(tabId);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 't':
                        e.preventDefault();
                        this.createNewTab();
                        break;
                    case 'w':
                        e.preventDefault();
                        this.closeActiveTab();
                        break;
                    case 'Tab':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.switchToPreviousTab();
                        } else {
                            this.switchToNextTab();
                        }
                        break;
                }
            }
        });
    }

    createInitialTab() {
        const initialTab = {
            id: 1,
            title: 'New Tab',
            url: 'carbonate://newtab',
            favicon: null,
            canGoBack: false,
            canGoForward: false,
            isLoading: false
        };

        this.tabs.set(1, initialTab);
        this.activeTabId = 1;
        this.updateTabUI();
    }

    createNewTab(url = 'carbonate://newtab', title = 'New Tab') {
        const tabId = this.nextTabId++;
        const newTab = {
            id: tabId,
            title: title,
            url: url,
            favicon: null,
            canGoBack: false,
            canGoForward: false,
            isLoading: false
        };

        this.tabs.set(tabId, newTab);
        this.switchToTab(tabId);
        this.updateTabUI();
        this.createTabContent(tabId);

        return tabId;
    }

    closeTab(tabId) {
        if (this.tabs.size <= 1) {
            // Don't close the last tab
            return;
        }

        this.tabs.delete(tabId);
        
        // Remove tab element
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabElement) {
            tabElement.remove();
        }

        // Remove tab content
        const contentElement = document.getElementById(`tab-${tabId}`);
        if (contentElement) {
            contentElement.remove();
        }

        // Switch to another tab if this was the active tab
        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0]);
            }
        }

        this.updateTabUI();
    }

    closeActiveTab() {
        this.closeTab(this.activeTabId);
    }

    switchToTab(tabId) {
        if (!this.tabs.has(tabId)) {
            return;
        }

        this.activeTabId = tabId;
        this.updateTabUI();
        this.updateAddressBar();
    }

    switchToNextTab() {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(this.activeTabId);
        const nextIndex = (currentIndex + 1) % tabIds.length;
        this.switchToTab(tabIds[nextIndex]);
    }

    switchToPreviousTab() {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(this.activeTabId);
        const previousIndex = currentIndex === 0 ? tabIds.length - 1 : currentIndex - 1;
        this.switchToTab(tabIds[previousIndex]);
    }

    updateTab(tabId, updates) {
        const tab = this.tabs.get(tabId);
        if (tab) {
            Object.assign(tab, updates);
            this.updateTabUI();
            
            if (tabId === this.activeTabId) {
                this.updateAddressBar();
            }
        }
    }

    updateTabUI() {
        // Update tab elements
        document.querySelectorAll('.tab').forEach(tabElement => {
            const tabId = parseInt(tabElement.dataset.tabId);
            const tab = this.tabs.get(tabId);
            
            if (tab) {
                const titleElement = tabElement.querySelector('.tab-title');
                if (titleElement) {
                    titleElement.textContent = tab.title;
                }

                // Update active state
                if (tabId === this.activeTabId) {
                    tabElement.classList.add('active');
                } else {
                    tabElement.classList.remove('active');
                }

                // Update loading state
                if (tab.isLoading) {
                    tabElement.classList.add('loading');
                } else {
                    tabElement.classList.remove('loading');
                }
            }
        });

        // Update tab content visibility
        document.querySelectorAll('.tab-content').forEach(contentElement => {
            const tabId = parseInt(contentElement.id.replace('tab-', ''));
            if (tabId === this.activeTabId) {
                contentElement.classList.add('active');
            } else {
                contentElement.classList.remove('active');
            }
        });

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateAddressBar() {
        const tab = this.tabs.get(this.activeTabId);
        if (tab) {
            const addressInput = document.getElementById('addressInput');
            if (addressInput) {
                addressInput.value = tab.url;
            }
        }
    }

    updateNavigationButtons() {
        const tab = this.tabs.get(this.activeTabId);
        if (!tab) return;

        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const refreshBtn = document.getElementById('refreshBtn');

        if (backBtn) {
            backBtn.disabled = !tab.canGoBack;
        }
        if (forwardBtn) {
            forwardBtn.disabled = !tab.canGoForward;
        }
        if (refreshBtn) {
            refreshBtn.disabled = tab.isLoading;
        }
    }

    createTabContent(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        const contentElement = document.createElement('div');
        contentElement.className = 'tab-content';
        contentElement.id = `tab-${tabId}`;

        if (tab.url === 'carbonate://newtab') {
            contentElement.innerHTML = this.getNewTabHTML();
        } else {
            contentElement.innerHTML = this.getWebContentHTML(tab.url);
        }

        contentArea.appendChild(contentElement);
    }

    getNewTabHTML() {
        return `
            <div class="new-tab-page">
                <div class="logo">
                    <h1>Carbonate Browser</h1>
                    <p>Fast, lightweight browsing with built-in apps</p>
                </div>
                
                <div class="search-container">
                    <div class="search-box">
                        <input type="text" id="newTabSearch" placeholder="Search with Yahoo or enter address" autocomplete="off">
                        <button id="newTabSearchBtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="quick-apps">
                    <h3>Built-in Apps</h3>
                    <div class="apps-grid" id="appsGrid">
                        <!-- Apps will be populated by JavaScript -->
                    </div>
                </div>

                <div class="bookmarks-section">
                    <h3>Bookmarks</h3>
                    <div class="bookmarks-grid" id="bookmarksGrid">
                        <!-- Bookmarks will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        `;
    }

    getWebContentHTML(url) {
        return `
            <div class="web-content">
                <div class="content-placeholder">
                    <h2>Web Content</h2>
                    <p>URL: ${url}</p>
                    <p>This is a placeholder for web content. In a real browser, this would display the actual webpage.</p>
                </div>
            </div>
        `;
    }

    navigateToUrl(url, tabId = null) {
        const targetTabId = tabId || this.activeTabId;
        const tab = this.tabs.get(targetTabId);
        
        if (tab) {
            this.updateTab(targetTabId, {
                url: url,
                title: this.extractTitleFromUrl(url),
                isLoading: true
            });

            // Simulate loading
            setTimeout(() => {
                this.updateTab(targetTabId, {
                    isLoading: false,
                    title: this.extractTitleFromUrl(url)
                });
            }, 1000);
        }
    }

    extractTitleFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return 'New Tab';
        }
    }

    getActiveTab() {
        return this.tabs.get(this.activeTabId);
    }

    getAllTabs() {
        return Array.from(this.tabs.values());
    }

    getTabCount() {
        return this.tabs.size;
    }

    // Public API for other components
    getCurrentTabId() {
        return this.activeTabId;
    }

    setTabTitle(tabId, title) {
        this.updateTab(tabId, { title });
    }

    setTabUrl(tabId, url) {
        this.updateTab(tabId, { url });
    }

    setTabLoading(tabId, isLoading) {
        this.updateTab(tabId, { isLoading });
    }
}

// Initialize tab manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tabManager = new TabManager();
});





