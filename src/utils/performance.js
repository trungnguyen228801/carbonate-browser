// Performance optimization utilities
const { app, BrowserWindow } = require('electron');

class PerformanceManager {
    constructor() {
        this.memoryThreshold = 100 * 1024 * 1024; // 100MB
        this.cpuThreshold = 80; // 80%
        this.init();
    }

    init() {
        this.setupMemoryMonitoring();
        this.setupCPUMonitoring();
        this.optimizeWindowSettings();
    }

    setupMemoryMonitoring() {
        setInterval(() => {
            const memInfo = process.memoryUsage();
            const heapUsed = memInfo.heapUsed;
            
            if (heapUsed > this.memoryThreshold) {
                this.triggerGarbageCollection();
                this.optimizeMemory();
            }
        }, 30000); // Check every 30 seconds
    }

    setupCPUMonitoring() {
        setInterval(() => {
            const cpuUsage = process.cpuUsage();
            const totalUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
            
            if (totalUsage > this.cpuThreshold) {
                this.optimizeCPU();
            }
        }, 60000); // Check every minute
    }

    optimizeWindowSettings() {
        // Optimize window creation settings
        const defaultWindowOptions = {
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                experimentalFeatures: false,
                // Performance optimizations
                backgroundThrottling: true,
                offscreen: false,
                // Memory optimizations
                v8CacheOptions: 'code',
                // Security optimizations
                sandbox: true
            }
        };

        return defaultWindowOptions;
    }

    triggerGarbageCollection() {
        if (global.gc) {
            global.gc();
            console.log('Garbage collection triggered');
        }
    }

    optimizeMemory() {
        // Clear unused caches
        this.clearUnusedCaches();
        
        // Optimize tab memory usage
        this.optimizeTabMemory();
        
        console.log('Memory optimization performed');
    }

    optimizeCPU() {
        // Reduce update frequency for non-active tabs
        this.throttleInactiveTabs();
        
        // Optimize rendering
        this.optimizeRendering();
        
        console.log('CPU optimization performed');
    }

    clearUnusedCaches() {
        // Clear browser caches for inactive tabs
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(window => {
            if (!window.isFocused()) {
                window.webContents.session.clearCache();
            }
        });
    }

    optimizeTabMemory() {
        // Implement tab memory optimization
        // This would involve suspending inactive tabs
        console.log('Tab memory optimization');
    }

    throttleInactiveTabs() {
        // Reduce update frequency for background tabs
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(window => {
            if (!window.isFocused()) {
                // Reduce animation frame rate for inactive windows
                window.webContents.executeJavaScript(`
                    if (window.requestAnimationFrame) {
                        const originalRAF = window.requestAnimationFrame;
                        window.requestAnimationFrame = function(callback) {
                            return originalRAF(function(timestamp) {
                                // Throttle to 30fps for inactive tabs
                                if (timestamp % 2 === 0) {
                                    callback(timestamp);
                                }
                            });
                        };
                    }
                `);
            }
        });
    }

    optimizeRendering() {
        // Optimize rendering performance
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(window => {
            window.webContents.executeJavaScript(`
                // Disable unnecessary animations for performance
                const style = document.createElement('style');
                style.textContent = \`
                    * {
                        animation-duration: 0.1s !important;
                        transition-duration: 0.1s !important;
                    }
                \`;
                document.head.appendChild(style);
            `);
        });
    }

    // Lazy loading for heavy components
    enableLazyLoading() {
        return `
            // Intersection Observer for lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                            observer.unobserve(element);
                        }
                    }
                });
            });

            // Observe all lazy-loaded elements
            document.querySelectorAll('[data-src]').forEach(element => {
                observer.observe(element);
            });
        `;
    }

    // Resource preloading
    preloadCriticalResources() {
        return `
            // Preload critical resources
            const criticalResources = [
                '/styles/main.css',
                '/styles/components.css',
                '/js/main.js'
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = resource.endsWith('.css') ? 'style' : 'script';
                document.head.appendChild(link);
            });
        `;
    }

    // Bundle optimization
    optimizeBundle() {
        return {
            // Webpack optimization settings
            optimization: {
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            enforce: true
                        }
                    }
                }
            },
            // Tree shaking
            usedExports: true,
            sideEffects: false
        };
    }

    // Database optimization
    optimizeDatabase() {
        return {
            // SQLite optimization settings
            pragma: {
                journal_mode: 'WAL',
                synchronous: 'NORMAL',
                cache_size: 10000,
                temp_store: 'MEMORY',
                mmap_size: 268435456 // 256MB
            }
        };
    }

    // Network optimization
    optimizeNetwork() {
        return {
            // HTTP/2 settings
            http2: true,
            // Compression
            compression: true,
            // Connection pooling
            keepAlive: true,
            // DNS caching
            dnsCache: true
        };
    }

    // Get performance metrics
    getPerformanceMetrics() {
        const memInfo = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        return {
            memory: {
                rss: memInfo.rss,
                heapTotal: memInfo.heapTotal,
                heapUsed: memInfo.heapUsed,
                external: memInfo.external
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: process.uptime(),
            platform: process.platform,
            arch: process.arch
        };
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        setInterval(() => {
            const metrics = this.getPerformanceMetrics();
            
            // Log performance metrics
            console.log('Performance Metrics:', {
                memory: `${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB`,
                uptime: `${Math.round(metrics.uptime)}s`,
                platform: metrics.platform
            });

            // Send metrics to analytics (if enabled)
            this.sendMetricsToAnalytics(metrics);
        }, 60000); // Every minute
    }

    sendMetricsToAnalytics(metrics) {
        // This would send metrics to an analytics service
        // For now, just log them
        console.log('Analytics metrics:', metrics);
    }
}

module.exports = PerformanceManager;





