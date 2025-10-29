class BookmarkManager {
  constructor(database) {
    this.database = database;
  }

  async addBookmark(bookmark) {
    try {
      const result = this.database.addBookmark(bookmark);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllBookmarks() {
    try {
      const bookmarks = this.database.getAllBookmarks();
      return { success: true, data: bookmarks };
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBookmark(id, bookmark) {
    try {
      const result = this.database.updateBookmark(id, bookmark);
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteBookmark(id) {
    try {
      const result = this.database.deleteBookmark(id);
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  async searchBookmarks(query) {
    try {
      const bookmarks = this.database.getAllBookmarks();
      const filtered = bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, data: filtered };
    } catch (error) {
      console.error('Failed to search bookmarks:', error);
      return { success: false, error: error.message };
    }
  }

  async importBookmarks(filePath) {
    try {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse HTML bookmarks file
      const bookmarks = this.parseBookmarksHTML(content);
      
      // Add each bookmark to database
      for (const bookmark of bookmarks) {
        await this.addBookmark(bookmark);
      }
      
      return { success: true, count: bookmarks.length };
    } catch (error) {
      console.error('Failed to import bookmarks:', error);
      return { success: false, error: error.message };
    }
  }

  async exportBookmarks(filePath) {
    try {
      const result = await this.getAllBookmarks();
      if (!result.success) {
        throw new Error(result.error);
      }

      const html = this.generateBookmarksHTML(result.data);
      
      const fs = require('fs');
      fs.writeFileSync(filePath, html, 'utf8');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to export bookmarks:', error);
      return { success: false, error: error.message };
    }
  }

  parseBookmarksHTML(html) {
    const bookmarks = [];
    const linkRegex = /<A HREF="([^"]*)"[^>]*>([^<]*)<\/A>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      bookmarks.push({
        title: match[2],
        url: match[1],
        favicon: '',
        folder_id: 0
      });
    }

    return bookmarks;
  }

  generateBookmarksHTML(bookmarks) {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${Date.now()}" LAST_MODIFIED="${Date.now()}" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>
    <DL><p>`;

    bookmarks.forEach(bookmark => {
      html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${Date.now()}">${bookmark.title}</A>\n`;
    });

    html += `    </DL><p>
</DL><p>`;

    return html;
  }
}

module.exports = BookmarkManager;
