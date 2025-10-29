const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config'), 'carbonate-browser', 'browser.db');
  }

  initialize() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  createTables() {
    // Bookmarks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        favicon TEXT,
        folder_id INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookmark folders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmark_folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // History table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        favicon TEXT,
        visit_count INTEGER DEFAULT 1,
        last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Downloads table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        url TEXT NOT NULL,
        filepath TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        downloaded INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Extensions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS extensions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        manifest TEXT NOT NULL,
        installed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url);
      CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);
      CREATE INDEX IF NOT EXISTS idx_history_last_visit ON history(last_visit);
      CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
    `);
  }

  // Bookmarks CRUD
  addBookmark(bookmark) {
    const stmt = this.db.prepare(`
      INSERT INTO bookmarks (title, url, favicon, folder_id)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(bookmark.title, bookmark.url, bookmark.favicon || '', bookmark.folder_id || 0);
  }

  getAllBookmarks() {
    const stmt = this.db.prepare(`
      SELECT * FROM bookmarks 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }

  updateBookmark(id, bookmark) {
    const stmt = this.db.prepare(`
      UPDATE bookmarks 
      SET title = ?, url = ?, favicon = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(bookmark.title, bookmark.url, bookmark.favicon || '', bookmark.folder_id || 0, id);
  }

  deleteBookmark(id) {
    const stmt = this.db.prepare('DELETE FROM bookmarks WHERE id = ?');
    return stmt.run(id);
  }

  // History CRUD
  addHistoryItem(historyItem) {
    // Check if URL already exists
    const existing = this.db.prepare('SELECT * FROM history WHERE url = ?').get(historyItem.url);
    
    if (existing) {
      // Update visit count and last visit
      const stmt = this.db.prepare(`
        UPDATE history 
        SET title = ?, favicon = ?, visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP
        WHERE url = ?
      `);
      return stmt.run(historyItem.title, historyItem.favicon || '', historyItem.url);
    } else {
      // Insert new history item
      const stmt = this.db.prepare(`
        INSERT INTO history (title, url, favicon)
        VALUES (?, ?, ?)
      `);
      return stmt.run(historyItem.title, historyItem.url, historyItem.favicon || '');
    }
  }

  getAllHistory() {
    const stmt = this.db.prepare(`
      SELECT * FROM history 
      ORDER BY last_visit DESC
    `);
    return stmt.all();
  }

  searchHistory(query) {
    const stmt = this.db.prepare(`
      SELECT * FROM history 
      WHERE title LIKE ? OR url LIKE ?
      ORDER BY last_visit DESC
      LIMIT 50
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm);
  }

  clearHistory() {
    const stmt = this.db.prepare('DELETE FROM history');
    return stmt.run();
  }

  // Downloads CRUD
  addDownload(download) {
    const stmt = this.db.prepare(`
      INSERT INTO downloads (filename, url, filepath, size, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(download.filename, download.url, download.filepath, download.size || 0, download.status || 'pending');
  }

  updateDownload(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE downloads SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
  }

  getAllDownloads() {
    const stmt = this.db.prepare(`
      SELECT * FROM downloads 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }

  // Settings CRUD
  getSetting(key) {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? JSON.parse(result.value) : null;
  }

  setSetting(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(key, JSON.stringify(value));
  }

  // Extensions CRUD
  addExtension(extension) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO extensions (id, name, version, enabled, manifest)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(extension.id, extension.name, extension.version, extension.enabled ? 1 : 0, JSON.stringify(extension.manifest));
  }

  getAllExtensions() {
    const stmt = this.db.prepare(`
      SELECT * FROM extensions 
      ORDER BY installed_at DESC
    `);
    return stmt.all();
  }

  updateExtension(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE extensions SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseManager;
