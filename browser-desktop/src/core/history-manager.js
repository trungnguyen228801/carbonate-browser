class HistoryManager {
  constructor(database) {
    this.database = database;
  }

  async addHistoryItem(historyItem) {
    try {
      const result = this.database.addHistoryItem(historyItem);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Failed to add history item:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllHistory() {
    try {
      const history = this.database.getAllHistory();
      return { success: true, data: history };
    } catch (error) {
      console.error('Failed to get history:', error);
      return { success: false, error: error.message };
    }
  }

  async searchHistory(query) {
    try {
      const history = this.database.searchHistory(query);
      return { success: true, data: history };
    } catch (error) {
      console.error('Failed to search history:', error);
      return { success: false, error: error.message };
    }
  }

  async clearHistory() {
    try {
      const result = this.database.clearHistory();
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Failed to clear history:', error);
      return { success: false, error: error.message };
    }
  }

  async getHistoryByDateRange(startDate, endDate) {
    try {
      const stmt = this.database.db.prepare(`
        SELECT * FROM history 
        WHERE last_visit BETWEEN ? AND ?
        ORDER BY last_visit DESC
      `);
      const history = stmt.all(startDate, endDate);
      return { success: true, data: history };
    } catch (error) {
      console.error('Failed to get history by date range:', error);
      return { success: false, error: error.message };
    }
  }

  async getMostVisitedSites(limit = 10) {
    try {
      const stmt = this.database.db.prepare(`
        SELECT * FROM history 
        ORDER BY visit_count DESC, last_visit DESC
        LIMIT ?
      `);
      const sites = stmt.all(limit);
      return { success: true, data: sites };
    } catch (error) {
      console.error('Failed to get most visited sites:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteHistoryItem(id) {
    try {
      const stmt = this.database.db.prepare('DELETE FROM history WHERE id = ?');
      const result = stmt.run(id);
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Failed to delete history item:', error);
      return { success: false, error: error.message };
    }
  }

  async getHistoryStats() {
    try {
      const totalStmt = this.database.db.prepare('SELECT COUNT(*) as total FROM history');
      const total = totalStmt.get().total;

      const todayStmt = this.database.db.prepare(`
        SELECT COUNT(*) as today FROM history 
        WHERE DATE(last_visit) = DATE('now')
      `);
      const today = todayStmt.get().today;

      const weekStmt = this.database.db.prepare(`
        SELECT COUNT(*) as week FROM history 
        WHERE last_visit >= DATE('now', '-7 days')
      `);
      const week = weekStmt.get().week;

      return {
        success: true,
        data: {
          total,
          today,
          week
        }
      };
    } catch (error) {
      console.error('Failed to get history stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = HistoryManager;
