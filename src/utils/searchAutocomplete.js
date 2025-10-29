const fetch = require('node-fetch');

/**
 * Setup search autocomplete functionality
 */
function setupSearchAutocomplete(mainWindow) {
    // This function sets up the search autocomplete in the main process
    // The actual autocomplete logic is handled in the renderer process
    console.log('Search autocomplete initialized');
}

/**
 * Get search suggestions from Yahoo
 */
async function getYahooSuggestions(query) {
    try {
        const url = `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?command=${encodeURIComponent(query)}&output=json`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.r && data.r.length > 0) {
            return data.r.map(item => item.k).slice(0, 5);
        }
        
        return [];
    } catch (error) {
        console.error('Failed to fetch Yahoo suggestions:', error);
        return [];
    }
}

/**
 * Get search suggestions from Google
 */
async function getGoogleSuggestions(query) {
    try {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
            return data[1].slice(0, 5);
        }
        
        return [];
    } catch (error) {
        console.error('Failed to fetch Google suggestions:', error);
        return [];
    }
}

/**
 * Get search suggestions from Bing
 */
async function getBingSuggestions(query) {
    try {
        const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
            return data[1].slice(0, 5);
        }
        
        return [];
    } catch (error) {
        console.error('Failed to fetch Bing suggestions:', error);
        return [];
    }
}

/**
 * Get search suggestions based on the selected search engine
 */
async function getSearchSuggestions(query, searchEngine = 'yahoo') {
    if (!query || query.length < 2) {
        return [];
    }
    
    try {
        let suggestions = [];
        
        switch (searchEngine.toLowerCase()) {
            case 'yahoo':
                suggestions = await getYahooSuggestions(query);
                break;
            case 'google':
                suggestions = await getGoogleSuggestions(query);
                break;
            case 'bing':
                suggestions = await getBingSuggestions(query);
                break;
            default:
                suggestions = await getYahooSuggestions(query);
        }
        
        // If no suggestions from the primary engine, try fallback
        if (suggestions.length === 0) {
            suggestions = await getYahooSuggestions(query);
        }
        
        return suggestions;
    } catch (error) {
        console.error('Failed to get search suggestions:', error);
        return getLocalSuggestions(query);
    }
}

/**
 * Get local suggestions as fallback
 */
function getLocalSuggestions(query) {
    const commonSearches = [
        'weather', 'news', 'youtube', 'facebook', 'twitter', 'instagram',
        'gmail', 'maps', 'translate', 'calculator', 'calendar', 'shopping',
        'amazon', 'ebay', 'wikipedia', 'reddit', 'stackoverflow', 'github',
        'weather today', 'news today', 'youtube music', 'facebook login',
        'twitter trending', 'instagram stories', 'gmail login', 'google maps',
        'translate english', 'calculator online', 'calendar 2024', 'shopping deals'
    ];
    
    const lowerQuery = query.toLowerCase();
    return commonSearches
        .filter(item => item.toLowerCase().includes(lowerQuery))
        .slice(0, 5);
}

/**
 * Get trending searches
 */
async function getTrendingSearches() {
    try {
        // Try to get trending searches from Yahoo
        const url = 'https://search.yahoo.com/trending';
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Simple regex to extract trending terms (this is a basic implementation)
        const trendingRegex = /<span[^>]*class="[^"]*trending[^"]*"[^>]*>([^<]+)<\/span>/gi;
        const trending = [];
        let match;
        
        while ((match = trendingRegex.exec(html)) !== null && trending.length < 10) {
            trending.push(match[1].trim());
        }
        
        return trending;
    } catch (error) {
        console.error('Failed to fetch trending searches:', error);
        return [
            'weather', 'news', 'covid-19', 'stock market', 'election',
            'sports', 'entertainment', 'technology', 'business', 'health'
        ];
    }
}

/**
 * Get search history suggestions
 */
function getSearchHistorySuggestions(query, searchHistory = []) {
    if (!query || query.length < 2) {
        return [];
    }
    
    const lowerQuery = query.toLowerCase();
    return searchHistory
        .filter(item => item.toLowerCase().includes(lowerQuery))
        .slice(0, 3);
}

/**
 * Cache for search suggestions
 */
const suggestionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached suggestions or fetch new ones
 */
async function getCachedSuggestions(query, searchEngine = 'yahoo') {
    const cacheKey = `${searchEngine}:${query}`;
    const cached = suggestionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.suggestions;
    }
    
    const suggestions = await getSearchSuggestions(query, searchEngine);
    suggestionCache.set(cacheKey, {
        suggestions,
        timestamp: Date.now()
    });
    
    return suggestions;
}

/**
 * Clear suggestion cache
 */
function clearSuggestionCache() {
    suggestionCache.clear();
}

module.exports = {
    setupSearchAutocomplete,
    getSearchSuggestions,
    getYahooSuggestions,
    getGoogleSuggestions,
    getBingSuggestions,
    getLocalSuggestions,
    getTrendingSearches,
    getSearchHistorySuggestions,
    getCachedSuggestions,
    clearSuggestionCache
};

