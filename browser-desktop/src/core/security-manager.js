class SecurityManager {
  constructor() {
    this.allowedSchemes = ['http:', 'https:', 'file:'];
    this.blockedDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ];
    this.trustedDomains = [
      'google.com',
      'youtube.com',
      'github.com',
      'stackoverflow.com'
    ];
  }

  validateUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Check scheme
      if (!this.allowedSchemes.includes(urlObj.protocol)) {
        return { valid: false, reason: 'Invalid protocol' };
      }

      // Check for blocked domains
      if (this.blockedDomains.includes(urlObj.hostname)) {
        return { valid: false, reason: 'Blocked domain' };
      }

      // Check for suspicious patterns
      if (this.isSuspiciousUrl(url)) {
        return { valid: false, reason: 'Suspicious URL pattern' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  isSuspiciousUrl(url) {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:\/\/\/etc\/passwd/i,
      /file:\/\/\/windows\/system32/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.vbs$/i,
      /\.js$/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  validateCSP(html) {
    // Basic CSP validation
    const cspPattern = /content-security-policy/i;
    return cspPattern.test(html);
  }

  checkForXSS(input) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  validateFileExtension(filename) {
    const allowedExtensions = [
      '.html', '.htm', '.css', '.js', '.json', '.xml', '.txt',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
      '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
      '.zip', '.rar', '.7z', '.tar', '.gz'
    ];

    const extension = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  generateCSP() {
    return {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
      'img-src': "'self' data: https: http:",
      'font-src': "'self' https://fonts.gstatic.com",
      'connect-src': "'self' https: wss:",
      'media-src': "'self' https: http:",
      'object-src': "'none'",
      'frame-src': "'self' https:",
      'base-uri': "'self'",
      'form-action': "'self'"
    };
  }

  validateExtensionManifest(manifest) {
    const requiredFields = ['name', 'version', 'manifest_version'];
    const allowedPermissions = [
      'activeTab',
      'tabs',
      'bookmarks',
      'history',
      'downloads',
      'storage',
      'notifications',
      'contextMenus'
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!manifest[field]) {
        return { valid: false, reason: `Missing required field: ${field}` };
      }
    }

    // Check manifest version
    if (manifest.manifest_version !== 2) {
      return { valid: false, reason: 'Unsupported manifest version' };
    }

    // Check permissions
    if (manifest.permissions) {
      for (const permission of manifest.permissions) {
        if (!allowedPermissions.includes(permission)) {
          return { valid: false, reason: `Disallowed permission: ${permission}` };
        }
      }
    }

    // Check content scripts
    if (manifest.content_scripts) {
      for (const script of manifest.content_scripts) {
        if (script.matches) {
          for (const match of script.matches) {
            if (!this.isValidMatchPattern(match)) {
              return { valid: false, reason: `Invalid match pattern: ${match}` };
            }
          }
        }
      }
    }

    return { valid: true };
  }

  isValidMatchPattern(pattern) {
    // Basic validation for match patterns
    const validPatterns = [
      /^https?:\/\/\*\.\w+\.\w+\/\*$/,
      /^https?:\/\/\w+\.\w+\/\*$/,
      /^https?:\/\/\*\.\w+\.\w+$/,
      /^https?:\/\/\w+\.\w+$/,
      /^https?:\/\/\*$/,
      /^https?:\/\/\*\/\*$/
    ];

    return validPatterns.some(regex => regex.test(pattern));
  }

  validateIPCChannel(channel) {
    const allowedChannels = [
      'tabs:create',
      'tabs:close',
      'tabs:getAll',
      'tabs:switch',
      'bookmarks:add',
      'bookmarks:getAll',
      'bookmarks:update',
      'bookmarks:delete',
      'history:add',
      'history:getAll',
      'history:search',
      'history:clear',
      'downloads:start',
      'downloads:pause',
      'downloads:resume',
      'downloads:cancel',
      'downloads:getAll',
      'settings:get',
      'settings:set',
      'security:validateUrl',
      'extensions:install',
      'extensions:getAll',
      'extensions:enable',
      'extensions:disable'
    ];

    return allowedChannels.includes(channel);
  }

  sanitizeIPCData(data) {
    if (typeof data === 'string') {
      return this.sanitizeInput(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeIPCData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeIPCData(value);
      }
      return sanitized;
    }

    return data;
  }

  checkForMaliciousContent(content) {
    const maliciousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /document\.write/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /\.src\s*=/gi,
      /\.href\s*=/gi,
      /window\.open/gi,
      /location\.href/gi,
      /location\.replace/gi
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  generateSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }
}

module.exports = SecurityManager;
