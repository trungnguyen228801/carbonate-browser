// Search functionality with autocomplete
class SearchManager {
    constructor() {
        this.suggestions = [];
        this.currentQuery = '';
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.setupSearchInputs();
        this.setupSuggestionHandling();
    }

    setupSearchInputs() {
        const addressInput = document.getElementById('addressInput');
        const newTabSearch = document.getElementById('newTabSearch');

        if (addressInput) {
            addressInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
            addressInput.addEventListener('focus', () => this.showSuggestions());
            addressInput.addEventListener('blur', () => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => this.hideSuggestions(), 200);
            });
        }

        if (newTabSearch) {
            newTabSearch.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        }
    }

    setupSuggestionHandling() {
        // Handle keyboard navigation in suggestions
        document.addEventListener('keydown', (e) => {
            const suggestions = document.getElementById('searchSuggestions');
            if (!suggestions || !suggestions.style.display || suggestions.style.display === 'none') {
                return;
            }

            const items = suggestions.querySelectorAll('.suggestion-item');
            const activeItem = suggestions.querySelector('.suggestion-item.active');

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateSuggestions(items, activeItem, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateSuggestions(items, activeItem, -1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (activeItem) {
                        this.selectSuggestion(activeItem.textContent);
                    }
                    break;
                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });
    }

    async handleSearchInput(query) {
        this.currentQuery = query.trim();
        
        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // If query is too short, hide suggestions
        if (this.currentQuery.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Debounce the search to avoid too many API calls
        this.debounceTimer = setTimeout(async () => {
            await this.fetchSuggestions(this.currentQuery);
        }, 300);
    }

    async fetchSuggestions(query) {
        try {
            // Get suggestions from Electron main process
            const suggestions = await window.electronAPI.getSearchSuggestions(query);
            this.suggestions = suggestions;
            this.displaySuggestions();
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            // Fallback to local suggestions
            this.generateLocalSuggestions(query);
        }
    }

    generateLocalSuggestions(query) {
        const commonSearches = [
            'weather', 'news', 'youtube', 'facebook', 'twitter', 'instagram',
            'gmail', 'maps', 'translate', 'calculator', 'calendar', 'shopping',
            'amazon', 'ebay', 'wikipedia', 'reddit', 'stackoverflow', 'github'
        ];

        this.suggestions = commonSearches
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .map(item => `${query} ${item}`)
            .slice(0, 5);
        
        this.displaySuggestions();
    }

    displaySuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        if (this.suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsContainer.innerHTML = this.suggestions.map(suggestion => `
            <div class="suggestion-item" data-suggestion="${suggestion}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                ${suggestion}
            </div>
        `).join('');

        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item.dataset.suggestion);
            });
        });

        this.showSuggestions();
    }

    showSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer && this.suggestions.length > 0) {
            suggestionsContainer.style.display = 'block';
        }
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    navigateSuggestions(items, activeItem, direction) {
        // Remove active class from current item
        if (activeItem) {
            activeItem.classList.remove('active');
        }

        let newIndex = 0;
        if (activeItem) {
            const currentIndex = Array.from(items).indexOf(activeItem);
            newIndex = currentIndex + direction;
        }

        // Wrap around
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;

        // Add active class to new item
        if (items[newIndex]) {
            items[newIndex].classList.add('active');
        }
    }

    selectSuggestion(suggestion) {
        // Update the address input
        const addressInput = document.getElementById('addressInput');
        if (addressInput) {
            addressInput.value = suggestion;
        }

        // Hide suggestions
        this.hideSuggestions();

        // Navigate to the suggestion
        if (window.browser) {
            window.browser.navigateToUrl(suggestion);
        }
    }

    // Public method to get search URL for a query
    getSearchUrl(query, searchEngine = 'yahoo') {
        const searchEngines = {
            yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`,
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        };
        return searchEngines[searchEngine] || searchEngines.yahoo;
    }

    // Method to perform a search
    performSearch(query, searchEngine = 'yahoo') {
        const searchUrl = this.getSearchUrl(query, searchEngine);
        if (window.browser) {
            window.browser.navigateToUrl(searchUrl);
        }
    }
}

// Initialize search manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});

