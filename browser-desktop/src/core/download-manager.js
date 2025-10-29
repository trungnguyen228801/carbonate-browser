const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class DownloadManager {
  constructor() {
    this.downloads = new Map();
    this.nextDownloadId = 1;
  }

  async startDownload(downloadInfo) {
    const downloadId = this.nextDownloadId++;
    
    const download = {
      id: downloadId,
      filename: downloadInfo.filename || this.extractFilenameFromUrl(downloadInfo.url),
      url: downloadInfo.url,
      filepath: downloadInfo.filepath || this.getDefaultDownloadPath(downloadInfo.filename),
      size: 0,
      downloaded: 0,
      status: 'pending',
      speed: 0,
      progress: 0,
      startTime: Date.now(),
      pauseTime: 0,
      totalPauseTime: 0
    };

    this.downloads.set(downloadId, download);
    
    // Start the actual download
    this.performDownload(downloadId);
    
    return { success: true, downloadId };
  }

  async pauseDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (!download) return { success: false, error: 'Download not found' };

    if (download.status === 'downloading') {
      download.status = 'paused';
      download.pauseTime = Date.now();
      
      if (download.request) {
        download.request.destroy();
      }
      
      this.notifyDownloadUpdate(download);
      return { success: true };
    }

    return { success: false, error: 'Download is not active' };
  }

  async resumeDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (!download) return { success: false, error: 'Download not found' };

    if (download.status === 'paused') {
      download.status = 'downloading';
      download.totalPauseTime += Date.now() - download.pauseTime;
      
      // Resume download from current position
      this.performDownload(downloadId, download.downloaded);
      
      return { success: true };
    }

    return { success: false, error: 'Download is not paused' };
  }

  async cancelDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (!download) return { success: false, error: 'Download not found' };

    download.status = 'cancelled';
    
    if (download.request) {
      download.request.destroy();
    }

    // Delete partial file
    try {
      if (fs.existsSync(download.filepath)) {
        fs.unlinkSync(download.filepath);
      }
    } catch (error) {
      console.error('Failed to delete partial file:', error);
    }

    this.notifyDownloadUpdate(download);
    return { success: true };
  }

  async getAllDownloads() {
    return Array.from(this.downloads.values());
  }

  performDownload(downloadId, startByte = 0) {
    const download = this.downloads.get(downloadId);
    if (!download) return;

    download.status = 'downloading';
    this.notifyDownloadUpdate(download);

    const url = new URL(download.url);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {}
    };

    if (startByte > 0) {
      options.headers['Range'] = `bytes=${startByte}-`;
    }

    const request = protocol.request(options, (response) => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        download.size = parseInt(response.headers['content-length']) || 0;
        
        const file = fs.createWriteStream(download.filepath, { flags: 'a' });
        
        response.on('data', (chunk) => {
          download.downloaded += chunk.length;
          download.progress = download.size > 0 ? (download.downloaded / download.size) * 100 : 0;
          
          // Calculate speed
          const elapsed = (Date.now() - download.startTime - download.totalPauseTime) / 1000;
          download.speed = elapsed > 0 ? download.downloaded / elapsed : 0;
          
          this.notifyDownloadUpdate(download);
        });

        response.on('end', () => {
          download.status = 'completed';
          download.progress = 100;
          this.notifyDownloadComplete(download);
        });

        response.on('error', (error) => {
          download.status = 'error';
          download.error = error.message;
          this.notifyDownloadUpdate(download);
        });

        response.pipe(file);
      } else {
        download.status = 'error';
        download.error = `HTTP ${response.statusCode}`;
        this.notifyDownloadUpdate(download);
      }
    });

    request.on('error', (error) => {
      download.status = 'error';
      download.error = error.message;
      this.notifyDownloadUpdate(download);
    });

    download.request = request;
    request.end();
  }

  extractFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = path.basename(pathname);
      return filename || 'download';
    } catch (error) {
      return 'download';
    }
  }

  getDefaultDownloadPath(filename) {
    const downloadsPath = path.join(require('os').homedir(), 'Downloads');
    return path.join(downloadsPath, filename);
  }

  notifyDownloadUpdate(download) {
    const { BrowserWindow } = require('electron');
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('download:update', download);
    });
  }

  notifyDownloadComplete(download) {
    const { BrowserWindow } = require('electron');
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('download:complete', download);
    });
  }

  cleanup() {
    // Cancel all active downloads
    this.downloads.forEach(download => {
      if (download.status === 'downloading' && download.request) {
        download.request.destroy();
      }
    });
    this.downloads.clear();
  }
}

module.exports = DownloadManager;
