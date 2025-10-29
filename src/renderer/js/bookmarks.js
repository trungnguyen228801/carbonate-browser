// Bookmarks Management System
class BookmarksManager {
    constructor() {
        this.bookmarks = [];
        this.bookmarkCategories = ['All', 'Work', 'Personal', 'Entertainment', 'News', 'Tools'];
        this.init();
    }

    async init() {
        await this.loadBookmarks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Bookmark button
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => this.showAddBookmarkDialog());
        }

        // Bookmark form submission
        const bookmarkForm = document.getElementById('bookmarkForm');
        if (bookmarkForm) {
            bookmarkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBookmark();
            });
        }

        // Bookmark manager
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-item') || e.target.closest('.bookmark-item')) {
                const bookmarkElement = e.target.closest('.bookmark-item');
                const url = bookmarkElement.dataset.url;
                if (url) {
                    this.openBookmark(url);
                }
            }
        });
    }

    async loadBookmarks() {
        try {
            this.bookmarks = await window.electronAPI.getBookmarks();
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            this.bookmarks = [];
        }
    }

    async addBookmark() {
        const title = document.getElementById('bookmarkTitle').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        const category = document.getElementById('bookmarkCategory')?.value || 'All';

        if (!title || !url) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        const bookmark = {
            id: Date.now() + Math.random(),
            title: title,
            url: url,
            category: category,
            dateAdded: new Date().toISOString(),
            favicon: null
        };

        try {
            await window.electronAPI.addBookmark(bookmark);
            this.bookmarks.push(bookmark);
            this.hideAddBookmarkDialog();
            this.showToast('Bookmark added successfully', 'success');
            this.renderBookmarks();
        } catch (error) {
            console.error('Failed to add bookmark:', error);
            this.showToast('Failed to add bookmark', 'error');
        }
    }

    async removeBookmark(bookmarkId) {
        try {
            await window.electronAPI.removeBookmark(bookmarkId);
            this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
            this.showToast('Bookmark removed successfully', 'success');
            this.renderBookmarks();
        } catch (error) {
            console.error('Failed to remove bookmark:', error);
            this.showToast('Failed to remove bookmark', 'error');
        }
    }

    async editBookmark(bookmarkId, updates) {
        try {
            const bookmarkIndex = this.bookmarks.findIndex(b => b.id === bookmarkId);
            if (bookmarkIndex !== -1) {
                this.bookmarks[bookmarkIndex] = { ...this.bookmarks[bookmarkIndex], ...updates };
                // Update in storage
                await window.electronAPI.setSetting('bookmarks', this.bookmarks);
                this.showToast('Bookmark updated successfully', 'success');
                this.renderBookmarks();
            }
        } catch (error) {
            console.error('Failed to edit bookmark:', error);
            this.showToast('Failed to update bookmark', 'error');
        }
    }

    showAddBookmarkDialog() {
        const modal = document.getElementById('bookmarkModal');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('bookmarkTitle').focus();
        }
    }

    hideAddBookmarkDialog() {
        const modal = document.getElementById('bookmarkModal');
        if (modal) {
            modal.classList.remove('show');
            document.getElementById('bookmarkForm').reset();
        }
    }

    openBookmark(url) {
        if (window.browser) {
            window.browser.navigateToUrl(url);
        }
    }

    renderBookmarks(containerId = 'bookmarksGrid', maxItems = 8) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const displayBookmarks = this.bookmarks.slice(0, maxItems);

        if (displayBookmarks.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No bookmarks yet. Add some to see them here!</p>';
            return;
        }

        container.innerHTML = displayBookmarks.map(bookmark => `
            <div class="bookmark-item" data-url="${bookmark.url}" title="${bookmark.title}">
                <div class="bookmark-icon">${this.getFavicon(bookmark)}</div>
                <div class="bookmark-name">${this.truncateText(bookmark.title, 20)}</div>
                <div class="bookmark-actions">
                    <button class="bookmark-edit" onclick="bookmarksManager.editBookmarkDialog(${bookmark.id})" title="Edit">✏️</button>
                    <button class="bookmark-delete" onclick="bookmarksManager.removeBookmark(${bookmark.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    renderBookmarkManager() {
        const modal = document.getElementById('bookmarkManagerModal');
        if (!modal) {
            this.createBookmarkManagerModal();
        }

        const container = document.getElementById('bookmarkManagerList');
        if (!container) return;

        // Group bookmarks by category
        const groupedBookmarks = this.groupBookmarksByCategory();

        container.innerHTML = Object.entries(groupedBookmarks).map(([category, bookmarks]) => `
            <div class="bookmark-category">
                <h3>${category} (${bookmarks.length})</h3>
                <div class="bookmark-list">
                    ${bookmarks.map(bookmark => `
                        <div class="bookmark-manager-item">
                            <div class="bookmark-info">
                                <div class="bookmark-favicon">${this.getFavicon(bookmark)}</div>
                                <div class="bookmark-details">
                                    <div class="bookmark-title">${bookmark.title}</div>
                                    <div class="bookmark-url">${bookmark.url}</div>
                                    <div class="bookmark-date">Added: ${new Date(bookmark.dateAdded).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div class="bookmark-manager-actions">
                                <button class="btn btn-secondary" onclick="bookmarksManager.openBookmark('${bookmark.url}')">Open</button>
                                <button class="btn btn-secondary" onclick="bookmarksManager.editBookmarkDialog(${bookmark.id})">Edit</button>
                                <button class="btn btn-danger" onclick="bookmarksManager.removeBookmark(${bookmark.id})">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        modal.classList.add('show');
    }

    createBookmarkManagerModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'bookmarkManagerModal';
        modal.innerHTML = `
            <div class="modal-content bookmark-manager-modal">
                <div class="modal-header">
                    <h3>Bookmark Manager</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="bookmark-manager-toolbar">
                        <button class="btn btn-primary" onclick="bookmarksManager.showAddBookmarkDialog()">Add Bookmark</button>
                        <button class="btn btn-secondary" onclick="bookmarksManager.exportBookmarks()">Export</button>
                        <button class="btn btn-secondary" onclick="bookmarksManager.importBookmarks()">Import</button>
                    </div>
                    <div id="bookmarkManagerList" class="bookmark-manager-list">
                        <!-- Bookmarks will be populated here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    editBookmarkDialog(bookmarkId) {
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Bookmark</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editBookmarkForm">
                        <div class="form-group">
                            <label for="editBookmarkTitle">Title:</label>
                            <input type="text" id="editBookmarkTitle" value="${bookmark.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="editBookmarkUrl">URL:</label>
                            <input type="url" id="editBookmarkUrl" value="${bookmark.url}" required>
                        </div>
                        <div class="form-group">
                            <label for="editBookmarkCategory">Category:</label>
                            <select id="editBookmarkCategory">
                                ${this.bookmarkCategories.map(cat => 
                                    `<option value="${cat}" ${cat === bookmark.category ? 'selected' : ''}>${cat}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');

        // Add form submission
        modal.querySelector('#editBookmarkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('editBookmarkTitle').value;
            const url = document.getElementById('editBookmarkUrl').value;
            const category = document.getElementById('editBookmarkCategory').value;

            this.editBookmark(bookmarkId, { title, url, category });
            modal.remove();
        });

        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    groupBookmarksByCategory() {
        const grouped = {};
        
        this.bookmarks.forEach(bookmark => {
            const category = bookmark.category || 'All';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(bookmark);
        });

        return grouped;
    }

    getFavicon(bookmark) {
        if (bookmark.favicon) {
            return `<img src="${bookmark.favicon}" alt="favicon" class="favicon">`;
        }
        
        // Default favicon based on domain
        try {
            const domain = new URL(bookmark.url).hostname;
            if (domain.includes('youtube')) return '📺';
            if (domain.includes('facebook')) return '📘';
            if (domain.includes('twitter')) return '🐦';
            if (domain.includes('instagram')) return '📷';
            if (domain.includes('github')) return '🐙';
            if (domain.includes('google')) return '🔍';
            if (domain.includes('amazon')) return '🛒';
            if (domain.includes('netflix')) return '🎬';
            if (domain.includes('spotify')) return '🎵';
        } catch (e) {
            // Invalid URL
        }
        
        return '🌐';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async exportBookmarks() {
        try {
            const dataStr = JSON.stringify(this.bookmarks, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'carbonate-bookmarks.json';
            link.click();
            
            this.showToast('Bookmarks exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export bookmarks:', error);
            this.showToast('Failed to export bookmarks', 'error');
        }
    }

    async importBookmarks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.html';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const content = await file.text();
                let importedBookmarks = [];

                if (file.name.endsWith('.json')) {
                    importedBookmarks = JSON.parse(content);
                } else if (file.name.endsWith('.html')) {
                    importedBookmarks = this.parseHTMLBookmarks(content);
                }

                // Add imported bookmarks
                for (const bookmark of importedBookmarks) {
                    if (bookmark.title && bookmark.url) {
                        const newBookmark = {
                            id: Date.now() + Math.random(),
                            title: bookmark.title,
                            url: bookmark.url,
                            category: bookmark.category || 'Imported',
                            dateAdded: new Date().toISOString()
                        };
                        
                        this.bookmarks.push(newBookmark);
                        await window.electronAPI.addBookmark(newBookmark);
                    }
                }

                this.showToast(`Imported ${importedBookmarks.length} bookmarks`, 'success');
                this.renderBookmarks();
            } catch (error) {
                console.error('Failed to import bookmarks:', error);
                this.showToast('Failed to import bookmarks', 'error');
            }
        };

        input.click();
    }

    parseHTMLBookmarks(htmlContent) {
        const bookmarks = [];
        const linkRegex = /<A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
        let match;
        
        while ((match = linkRegex.exec(htmlContent)) !== null) {
            const url = match[1];
            const title = match[2].trim();
            
            if (url && title && this.isValidUrl(url)) {
                bookmarks.push({
                    title: title,
                    url: url,
                    category: 'Imported'
                });
            }
        }
        
        return bookmarks;
    }

    searchBookmarks(query) {
        if (!query) return this.bookmarks;
        
        const lowerQuery = query.toLowerCase();
        return this.bookmarks.filter(bookmark => 
            bookmark.title.toLowerCase().includes(lowerQuery) ||
            bookmark.url.toLowerCase().includes(lowerQuery) ||
            (bookmark.category && bookmark.category.toLowerCase().includes(lowerQuery))
        );
    }

    getBookmarksByCategory(category) {
        if (category === 'All') return this.bookmarks;
        return this.bookmarks.filter(bookmark => bookmark.category === category);
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

// Initialize bookmarks manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookmarksManager = new BookmarksManager();
});





