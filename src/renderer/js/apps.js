// Built-in Apps System
class AppsManager {
    constructor() {
        this.apps = new Map();
        this.curatedContent = [];
        this.init();
    }

    init() {
        this.registerBuiltInApps();
        this.loadCuratedContent();
    }

    registerBuiltInApps() {
        // Calculator App
        this.registerApp('calculator', {
            name: 'Calculator',
            icon: '🧮',
            description: 'Basic calculator for quick calculations',
            category: 'tools',
            url: 'calculator://',
            component: 'CalculatorApp'
        });

        // Notes App
        this.registerApp('notes', {
            name: 'Notes',
            icon: '📝',
            description: 'Take quick notes and save them locally',
            category: 'productivity',
            url: 'notes://',
            component: 'NotesApp'
        });

        // Weather App
        this.registerApp('weather', {
            name: 'Weather',
            icon: '🌤️',
            description: 'Check current weather and forecast',
            category: 'information',
            url: 'weather://',
            component: 'WeatherApp'
        });

        // News App
        this.registerApp('news', {
            name: 'News',
            icon: '📰',
            description: 'Latest news from various sources',
            category: 'information',
            url: 'news://',
            component: 'NewsApp'
        });

        // Calendar App
        this.registerApp('calendar', {
            name: 'Calendar',
            icon: '📅',
            description: 'Calendar and event management',
            category: 'productivity',
            url: 'calendar://',
            component: 'CalendarApp'
        });

        // Files App
        this.registerApp('files', {
            name: 'Files',
            icon: '📁',
            description: 'File manager and browser',
            category: 'tools',
            url: 'files://',
            component: 'FilesApp'
        });

        // Settings App
        this.registerApp('settings', {
            name: 'Settings',
            icon: '⚙️',
            description: 'Browser settings and preferences',
            category: 'system',
            url: 'settings://',
            component: 'SettingsApp'
        });

        // Help App
        this.registerApp('help', {
            name: 'Help',
            icon: '❓',
            description: 'Help and support information',
            category: 'system',
            url: 'help://',
            component: 'HelpApp'
        });
    }

    registerApp(id, appConfig) {
        this.apps.set(id, {
            id,
            ...appConfig,
            installed: true,
            dateAdded: new Date().toISOString()
        });
    }

    loadCuratedContent() {
        this.curatedContent = [
            {
                id: 'trending-news',
                title: 'Trending News',
                type: 'news',
                items: [
                    { title: 'Technology Updates', url: 'https://techcrunch.com', description: 'Latest tech news' },
                    { title: 'World News', url: 'https://bbc.com/news', description: 'Global news coverage' },
                    { title: 'Business News', url: 'https://bloomberg.com', description: 'Financial and business updates' }
                ]
            },
            {
                id: 'popular-apps',
                title: 'Popular Apps',
                type: 'apps',
                items: [
                    { title: 'YouTube', url: 'https://youtube.com', description: 'Video streaming platform' },
                    { title: 'Gmail', url: 'https://gmail.com', description: 'Email service' },
                    { title: 'Google Maps', url: 'https://maps.google.com', description: 'Navigation and maps' },
                    { title: 'Facebook', url: 'https://facebook.com', description: 'Social networking' },
                    { title: 'Twitter', url: 'https://twitter.com', description: 'Social media platform' },
                    { title: 'Instagram', url: 'https://instagram.com', description: 'Photo sharing' }
                ]
            },
            {
                id: 'productivity-tools',
                title: 'Productivity Tools',
                type: 'tools',
                items: [
                    { title: 'Google Drive', url: 'https://drive.google.com', description: 'Cloud storage' },
                    { title: 'Google Docs', url: 'https://docs.google.com', description: 'Document editor' },
                    { title: 'Trello', url: 'https://trello.com', description: 'Project management' },
                    { title: 'Slack', url: 'https://slack.com', description: 'Team communication' }
                ]
            },
            {
                id: 'entertainment',
                title: 'Entertainment',
                type: 'entertainment',
                items: [
                    { title: 'Netflix', url: 'https://netflix.com', description: 'Streaming service' },
                    { title: 'Spotify', url: 'https://spotify.com', description: 'Music streaming' },
                    { title: 'Twitch', url: 'https://twitch.tv', description: 'Live streaming' },
                    { title: 'Reddit', url: 'https://reddit.com', description: 'Community discussions' }
                ]
            }
        ];
    }

    getApp(id) {
        return this.apps.get(id);
    }

    getAllApps() {
        return Array.from(this.apps.values());
    }

    getAppsByCategory(category) {
        return this.getAllApps().filter(app => app.category === category);
    }

    getCuratedContent() {
        return this.curatedContent;
    }

    getCuratedContentByType(type) {
        return this.curatedContent.filter(content => content.type === type);
    }

    openApp(appId) {
        const app = this.getApp(appId);
        if (!app) {
            console.error(`App ${appId} not found`);
            return;
        }

        // For built-in apps, show the app interface
        if (app.component) {
            this.showAppInterface(app);
        } else {
            // For external apps, navigate to URL
            if (window.browser) {
                window.browser.navigateToUrl(app.url);
            }
        }
    }

    showAppInterface(app) {
        // Create a new tab for the app
        if (window.browser) {
            window.browser.createNewTab();
            // Set the tab title and content
            this.renderAppInTab(app);
        }
    }

    renderAppInTab(app) {
        const currentTab = document.querySelector('.tab.active');
        const currentTabContent = document.querySelector('.tab-content.active');
        
        if (currentTab && currentTabContent) {
            // Update tab title
            const tabTitle = currentTab.querySelector('.tab-title');
            if (tabTitle) {
                tabTitle.textContent = app.name;
            }

            // Render app content
            currentTabContent.innerHTML = this.getAppHTML(app);
            
            // Initialize app functionality
            this.initializeApp(app);
        }
    }

    getAppHTML(app) {
        switch (app.component) {
            case 'CalculatorApp':
                return this.getCalculatorHTML();
            case 'NotesApp':
                return this.getNotesHTML();
            case 'WeatherApp':
                return this.getWeatherHTML();
            case 'NewsApp':
                return this.getNewsHTML();
            case 'CalendarApp':
                return this.getCalendarHTML();
            case 'FilesApp':
                return this.getFilesHTML();
            case 'SettingsApp':
                return this.getSettingsHTML();
            case 'HelpApp':
                return this.getHelpHTML();
            default:
                return `<div class="app-container"><h2>${app.name}</h2><p>App coming soon!</p></div>`;
        }
    }

    getCalculatorHTML() {
        return `
            <div class="app-container calculator-app">
                <div class="app-header">
                    <h2>🧮 Calculator</h2>
                </div>
                <div class="calculator">
                    <div class="calculator-display">
                        <input type="text" id="calcDisplay" readonly value="0">
                    </div>
                    <div class="calculator-buttons">
                        <button class="calc-btn clear" onclick="appsManager.clearCalculator()">C</button>
                        <button class="calc-btn operator" onclick="appsManager.calculatorOperation('±')">±</button>
                        <button class="calc-btn operator" onclick="appsManager.calculatorOperation('%')">%</button>
                        <button class="calc-btn operator" onclick="appsManager.calculatorOperation('÷')">÷</button>
                        
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('7')">7</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('8')">8</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('9')">9</button>
                        <button class="calc-btn operator" onclick="appsManager.calculatorOperation('×')">×</button>
                        
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('4')">4</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('5')">5</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('6')">6</button>
                        <button class="calc-btn operator" onclick="appsManager.calculatorOperation('-')">-</button>
                        
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('1')">1</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('2')">2</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('3')">3</button>
                        <button class="calc-btn operator" onclick="appsManager.calculatorOperation('+')">+</button>
                        
                        <button class="calc-btn number zero" onclick="appsManager.calculatorInput('0')">0</button>
                        <button class="calc-btn number" onclick="appsManager.calculatorInput('.')">.</button>
                        <button class="calc-btn equals" onclick="appsManager.calculatorEquals()">=</button>
                    </div>
                </div>
            </div>
        `;
    }

    getNotesHTML() {
        return `
            <div class="app-container notes-app">
                <div class="app-header">
                    <h2>📝 Notes</h2>
                    <button class="btn btn-primary" onclick="appsManager.saveNote()">Save Note</button>
                </div>
                <div class="notes-content">
                    <input type="text" id="noteTitle" placeholder="Note title..." class="note-title-input">
                    <textarea id="noteContent" placeholder="Start writing your note..." class="note-content-textarea"></textarea>
                </div>
                <div class="notes-list">
                    <h3>Saved Notes</h3>
                    <div id="savedNotes" class="saved-notes-container">
                        <!-- Saved notes will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    getWeatherHTML() {
        return `
            <div class="app-container weather-app">
                <div class="app-header">
                    <h2>🌤️ Weather</h2>
                    <button class="btn btn-secondary" onclick="appsManager.refreshWeather()">Refresh</button>
                </div>
                <div class="weather-content">
                    <div class="location-input">
                        <input type="text" id="weatherLocation" placeholder="Enter city name..." value="New York">
                        <button class="btn btn-primary" onclick="appsManager.getWeather()">Get Weather</button>
                    </div>
                    <div id="weatherDisplay" class="weather-display">
                        <div class="loading">Loading weather data...</div>
                    </div>
                </div>
            </div>
        `;
    }

    getNewsHTML() {
        return `
            <div class="app-container news-app">
                <div class="app-header">
                    <h2>📰 News</h2>
                    <button class="btn btn-secondary" onclick="appsManager.refreshNews()">Refresh</button>
                </div>
                <div class="news-content">
                    <div class="news-categories">
                        <button class="news-category active" onclick="appsManager.loadNewsCategory('general')">General</button>
                        <button class="news-category" onclick="appsManager.loadNewsCategory('technology')">Technology</button>
                        <button class="news-category" onclick="appsManager.loadNewsCategory('business')">Business</button>
                        <button class="news-category" onclick="appsManager.loadNewsCategory('sports')">Sports</button>
                    </div>
                    <div id="newsDisplay" class="news-display">
                        <div class="loading">Loading news...</div>
                    </div>
                </div>
            </div>
        `;
    }

    getCalendarHTML() {
        return `
            <div class="app-container calendar-app">
                <div class="app-header">
                    <h2>📅 Calendar</h2>
                    <button class="btn btn-primary" onclick="appsManager.addEvent()">Add Event</button>
                </div>
                <div class="calendar-content">
                    <div class="calendar-navigation">
                        <button onclick="appsManager.previousMonth()">←</button>
                        <h3 id="currentMonth">January 2024</h3>
                        <button onclick="appsManager.nextMonth()">→</button>
                    </div>
                    <div id="calendarGrid" class="calendar-grid">
                        <!-- Calendar will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    getFilesHTML() {
        return `
            <div class="app-container files-app">
                <div class="app-header">
                    <h2>📁 Files</h2>
                    <button class="btn btn-secondary" onclick="appsManager.refreshFiles()">Refresh</button>
                </div>
                <div class="files-content">
                    <div class="files-navigation">
                        <button class="btn btn-secondary" onclick="appsManager.goUpDirectory()">↑ Up</button>
                        <span id="currentPath" class="current-path">/</span>
                    </div>
                    <div id="filesList" class="files-list">
                        <div class="loading">Loading files...</div>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsHTML() {
        return `
            <div class="app-container settings-app">
                <div class="app-header">
                    <h2>⚙️ Settings</h2>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <h3>General</h3>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="appAutoLaunch"> 
                                Start Carbonate Browser when Windows starts
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="appShowBookmarks"> 
                                Show bookmarks on new tab page
                            </label>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Search</h3>
                        <div class="setting-item">
                            <label for="appSearchEngine">Default Search Engine:</label>
                            <select id="appSearchEngine">
                                <option value="yahoo">Yahoo</option>
                                <option value="google">Google</option>
                                <option value="bing">Bing</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getHelpHTML() {
        return `
            <div class="app-container help-app">
                <div class="app-header">
                    <h2>❓ Help & Support</h2>
                </div>
                <div class="help-content">
                    <div class="help-section">
                        <h3>Getting Started</h3>
                        <p>Welcome to Carbonate Browser! Here are some tips to get you started:</p>
                        <ul>
                            <li>Use the address bar to search with Yahoo or navigate to websites</li>
                            <li>Click the bookmark button to save your favorite pages</li>
                            <li>Access built-in apps from the new tab page or the apps button</li>
                            <li>Import your bookmarks from other browsers in the File menu</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>Keyboard Shortcuts</h3>
                        <ul>
                            <li><kbd>Ctrl+T</kbd> - New tab</li>
                            <li><kbd>Ctrl+N</kbd> - New window</li>
                            <li><kbd>Ctrl+D</kbd> - Add bookmark</li>
                            <li><kbd>Ctrl+,</kbd> - Open settings</li>
                            <li><kbd>F5</kbd> - Refresh page</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>Built-in Apps</h3>
                        <p>Carbonate Browser comes with several built-in apps:</p>
                        <ul>
                            <li><strong>Calculator</strong> - Basic calculator for quick calculations</li>
                            <li><strong>Notes</strong> - Take and save notes locally</li>
                            <li><strong>Weather</strong> - Check current weather and forecast</li>
                            <li><strong>News</strong> - Latest news from various sources</li>
                            <li><strong>Calendar</strong> - Calendar and event management</li>
                            <li><strong>Files</strong> - File manager and browser</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    initializeApp(app) {
        switch (app.component) {
            case 'CalculatorApp':
                this.initializeCalculator();
                break;
            case 'NotesApp':
                this.initializeNotes();
                break;
            case 'WeatherApp':
                this.initializeWeather();
                break;
            case 'NewsApp':
                this.initializeNews();
                break;
            case 'CalendarApp':
                this.initializeCalendar();
                break;
            case 'FilesApp':
                this.initializeFiles();
                break;
            case 'SettingsApp':
                this.initializeSettings();
                break;
        }
    }

    // Calculator functionality
    initializeCalculator() {
        this.calculatorState = {
            display: '0',
            previousValue: null,
            operation: null,
            waitingForNewValue: false
        };
    }

    calculatorInput(value) {
        const display = document.getElementById('calcDisplay');
        if (!display) return;

        if (this.calculatorState.waitingForNewValue) {
            this.calculatorState.display = value;
            this.calculatorState.waitingForNewValue = false;
        } else {
            this.calculatorState.display = this.calculatorState.display === '0' ? value : this.calculatorState.display + value;
        }

        display.value = this.calculatorState.display;
    }

    calculatorOperation(operation) {
        if (this.calculatorState.previousValue === null) {
            this.calculatorState.previousValue = parseFloat(this.calculatorState.display);
        } else if (this.calculatorState.operation) {
            const currentValue = parseFloat(this.calculatorState.display);
            this.calculatorState.previousValue = this.calculate(this.calculatorState.previousValue, currentValue, this.calculatorState.operation);
            document.getElementById('calcDisplay').value = this.calculatorState.previousValue;
        }

        this.calculatorState.waitingForNewValue = true;
        this.calculatorState.operation = operation;
    }

    calculatorEquals() {
        const currentValue = parseFloat(this.calculatorState.display);
        if (this.calculatorState.previousValue !== null && this.calculatorState.operation) {
            const result = this.calculate(this.calculatorState.previousValue, currentValue, this.calculatorState.operation);
            document.getElementById('calcDisplay').value = result;
            this.calculatorState.display = result.toString();
            this.calculatorState.previousValue = null;
            this.calculatorState.operation = null;
            this.calculatorState.waitingForNewValue = true;
        }
    }

    calculate(a, b, operation) {
        switch (operation) {
            case '+': return a + b;
            case '-': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 0;
            case '%': return a % b;
            default: return b;
        }
    }

    clearCalculator() {
        this.calculatorState = {
            display: '0',
            previousValue: null,
            operation: null,
            waitingForNewValue: false
        };
        document.getElementById('calcDisplay').value = '0';
    }

    // Notes functionality
    initializeNotes() {
        this.loadSavedNotes();
    }

    saveNote() {
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;

        if (!title || !content) {
            alert('Please enter both title and content');
            return;
        }

        const note = {
            id: Date.now(),
            title,
            content,
            dateCreated: new Date().toISOString()
        };

        const savedNotes = JSON.parse(localStorage.getItem('carbonateNotes') || '[]');
        savedNotes.push(note);
        localStorage.setItem('carbonateNotes', JSON.stringify(savedNotes));

        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        this.loadSavedNotes();
    }

    loadSavedNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('carbonateNotes') || '[]');
        const container = document.getElementById('savedNotes');
        
        if (!container) return;

        if (savedNotes.length === 0) {
            container.innerHTML = '<p>No saved notes yet.</p>';
            return;
        }

        container.innerHTML = savedNotes.map(note => `
            <div class="saved-note">
                <h4>${note.title}</h4>
                <p>${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
                <small>${new Date(note.dateCreated).toLocaleDateString()}</small>
                <button onclick="appsManager.deleteNote(${note.id})">Delete</button>
            </div>
        `).join('');
    }

    deleteNote(noteId) {
        const savedNotes = JSON.parse(localStorage.getItem('carbonateNotes') || '[]');
        const filteredNotes = savedNotes.filter(note => note.id !== noteId);
        localStorage.setItem('carbonateNotes', JSON.stringify(filteredNotes));
        this.loadSavedNotes();
    }

    // Weather functionality
    initializeWeather() {
        this.getWeather();
    }

    async getWeather() {
        const location = document.getElementById('weatherLocation').value;
        const display = document.getElementById('weatherDisplay');
        
        if (!display) return;

        display.innerHTML = '<div class="loading">Loading weather data...</div>';

        try {
            // Mock weather data for demonstration
            const weatherData = {
                location: location,
                temperature: Math.floor(Math.random() * 30) + 10,
                condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
                humidity: Math.floor(Math.random() * 40) + 40,
                windSpeed: Math.floor(Math.random() * 20) + 5
            };

            display.innerHTML = `
                <div class="weather-card">
                    <h3>${weatherData.location}</h3>
                    <div class="weather-main">
                        <div class="temperature">${weatherData.temperature}°C</div>
                        <div class="condition">${weatherData.condition}</div>
                    </div>
                    <div class="weather-details">
                        <div class="detail">
                            <span>Humidity:</span>
                            <span>${weatherData.humidity}%</span>
                        </div>
                        <div class="detail">
                            <span>Wind Speed:</span>
                            <span>${weatherData.windSpeed} km/h</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            display.innerHTML = '<div class="error">Failed to load weather data</div>';
        }
    }

    refreshWeather() {
        this.getWeather();
    }

    // News functionality
    initializeNews() {
        this.loadNewsCategory('general');
    }

    async loadNewsCategory(category) {
        const display = document.getElementById('newsDisplay');
        if (!display) return;

        display.innerHTML = '<div class="loading">Loading news...</div>';

        // Update active category button
        document.querySelectorAll('.news-category').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick="appsManager.loadNewsCategory('${category}')"]`).classList.add('active');

        try {
            // Mock news data for demonstration
            const newsData = [
                { title: 'Breaking News: Technology Advances', summary: 'Latest developments in technology...', url: '#' },
                { title: 'Business Update: Market Trends', summary: 'Current market conditions and trends...', url: '#' },
                { title: 'Science Discovery: New Research', summary: 'Recent scientific breakthroughs...', url: '#' }
            ];

            display.innerHTML = newsData.map(article => `
                <div class="news-article">
                    <h4>${article.title}</h4>
                    <p>${article.summary}</p>
                    <a href="${article.url}" target="_blank">Read more</a>
                </div>
            `).join('');
        } catch (error) {
            display.innerHTML = '<div class="error">Failed to load news</div>';
        }
    }

    refreshNews() {
        const activeCategory = document.querySelector('.news-category.active');
        if (activeCategory) {
            const category = activeCategory.textContent.toLowerCase();
            this.loadNewsCategory(category);
        }
    }

    // Calendar functionality
    initializeCalendar() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    renderCalendar() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        const currentMonth = document.getElementById('currentMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
        if (!currentMonth || !calendarGrid) return;

        currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let calendarHTML = '<div class="calendar-header">';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        calendarHTML += '</div>';

        calendarHTML += '<div class="calendar-days">';
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === new Date().getDate() && 
                           this.currentDate.getMonth() === new Date().getMonth() &&
                           this.currentDate.getFullYear() === new Date().getFullYear();
            
            calendarHTML += `<div class="calendar-day ${isToday ? 'today' : ''}" onclick="appsManager.selectDate(${day})">${day}</div>`;
        }

        calendarHTML += '</div>';
        calendarGrid.innerHTML = calendarHTML;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    selectDate(day) {
        console.log(`Selected date: ${day}/${this.currentDate.getMonth() + 1}/${this.currentDate.getFullYear()}`);
    }

    addEvent() {
        alert('Add Event functionality coming soon!');
    }

    // Files functionality
    initializeFiles() {
        this.currentPath = '/';
        this.loadFiles();
    }

    loadFiles() {
        const filesList = document.getElementById('filesList');
        const currentPathElement = document.getElementById('currentPath');
        
        if (!filesList || !currentPathElement) return;

        currentPathElement.textContent = this.currentPath;

        // Mock file system for demonstration
        const mockFiles = [
            { name: 'Documents', type: 'folder', size: '-' },
            { name: 'Pictures', type: 'folder', size: '-' },
            { name: 'Downloads', type: 'folder', size: '-' },
            { name: 'readme.txt', type: 'file', size: '1.2 KB' },
            { name: 'config.json', type: 'file', size: '856 B' }
        ];

        filesList.innerHTML = mockFiles.map(file => `
            <div class="file-item ${file.type}" onclick="appsManager.openFile('${file.name}')">
                <span class="file-icon">${file.type === 'folder' ? '📁' : '📄'}</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${file.size}</span>
            </div>
        `).join('');
    }

    openFile(fileName) {
        console.log(`Opening file: ${fileName}`);
    }

    goUpDirectory() {
        if (this.currentPath !== '/') {
            this.currentPath = this.currentPath.split('/').slice(0, -1).join('/') || '/';
            this.loadFiles();
        }
    }

    refreshFiles() {
        this.loadFiles();
    }

    // Settings functionality
    initializeSettings() {
        // Load current settings
        const autoLaunchCheckbox = document.getElementById('appAutoLaunch');
        const showBookmarksCheckbox = document.getElementById('appShowBookmarks');
        const searchEngineSelect = document.getElementById('appSearchEngine');

        if (autoLaunchCheckbox) {
            autoLaunchCheckbox.checked = window.browser?.settings?.autoLaunch || false;
            autoLaunchCheckbox.addEventListener('change', async (e) => {
                await window.electronAPI.setSetting('autoLaunch', e.target.checked);
            });
        }

        if (showBookmarksCheckbox) {
            showBookmarksCheckbox.checked = window.browser?.settings?.showBookmarks !== false;
            showBookmarksCheckbox.addEventListener('change', async (e) => {
                await window.electronAPI.setSetting('showBookmarks', e.target.checked);
            });
        }

        if (searchEngineSelect) {
            searchEngineSelect.value = window.browser?.settings?.searchEngine || 'yahoo';
            searchEngineSelect.addEventListener('change', async (e) => {
                await window.electronAPI.setSetting('searchEngine', e.target.value);
            });
        }
    }
}

// Initialize apps manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appsManager = new AppsManager();
});





