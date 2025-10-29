import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import TabBar from './components/TabBar';
import AddressBar from './components/AddressBar';
import WebView from './components/WebView';
import Sidebar from './components/Sidebar';
import DownloadManager from './components/DownloadManager';
import Settings from './components/Settings';
import NewTabPage from './components/NewTabPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const WebViewContainer = styled.div`
  flex: 1;
  position: relative;
  background: #fff;
`;

const App = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [downloadsVisible, setDownloadsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [downloads, setDownloads] = useState([]);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load initial data
      const [tabsData, bookmarksData, historyData, downloadsData] = await Promise.all([
        window.electronAPI.getAllTabs(),
        window.electronAPI.getAllBookmarks(),
        window.electronAPI.getAllHistory(),
        window.electronAPI.getAllDownloads()
      ]);

      if (tabsData.success) {
        setTabs(tabsData.data);
        if (tabsData.data.length > 0) {
          setActiveTabId(tabsData.data[0].id);
        }
      }

      if (bookmarksData.success) {
        setBookmarks(bookmarksData.data);
      }

      if (historyData.success) {
        setHistory(historyData.data);
      }

      if (downloadsData.success) {
        setDownloads(downloadsData.data);
      }

      // Setup event listeners
      setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const setupEventListeners = () => {
    // Tab events
    window.electronAPI.onTabCreated((event, tab) => {
      setTabs(prev => [...prev, tab]);
      setActiveTabId(tab.id);
    });

    window.electronAPI.onTabClosed((event, tabId) => {
      setTabs(prev => prev.filter(tab => tab.id !== tabId));
      if (activeTabId === tabId) {
        const remainingTabs = tabs.filter(tab => tab.id !== tabId);
        setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
      }
    });

    // Download events
    window.electronAPI.onDownloadProgress((event, download) => {
      setDownloads(prev => prev.map(d => d.id === download.id ? download : d));
    });

    window.electronAPI.onDownloadComplete((event, download) => {
      setDownloads(prev => prev.map(d => d.id === download.id ? download : d));
    });

    // Bookmark events
    window.electronAPI.onBookmarkAdded((event, bookmark) => {
      setBookmarks(prev => [...prev, bookmark]);
    });

    // History events
    window.electronAPI.onHistoryAdded((event, historyItem) => {
      setHistory(prev => [historyItem, ...prev]);
    });
  };

  const createNewTab = async (url = 'about:blank') => {
    try {
      const result = await window.electronAPI.createTab(url);
      if (result.success) {
        // Tab will be added via event listener
      }
    } catch (error) {
      console.error('Failed to create tab:', error);
    }
  };

  const closeTab = async (tabId) => {
    try {
      const result = await window.electronAPI.closeTab(tabId);
      if (result.success) {
        // Tab will be removed via event listener
      }
    } catch (error) {
      console.error('Failed to close tab:', error);
    }
  };

  const switchTab = async (tabId) => {
    try {
      const result = await window.electronAPI.switchTab(tabId);
      if (result.success) {
        setActiveTabId(tabId);
      }
    } catch (error) {
      console.error('Failed to switch tab:', error);
    }
  };

  const navigateToUrl = async (url) => {
    if (!activeTabId) return;

    try {
      // Add to history
      await window.electronAPI.addHistoryItem({
        title: 'Loading...',
        url: url,
        favicon: ''
      });

      // Navigate in active tab
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        // Update tab URL
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId ? { ...tab, url: url, isLoading: true } : tab
        ));
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
    }
  };

  const addBookmark = async (bookmark) => {
    try {
      const result = await window.electronAPI.addBookmark(bookmark);
      if (result.success) {
        // Bookmark will be added via event listener
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  const getActiveTab = () => {
    return tabs.find(tab => tab.id === activeTabId);
  };

  const isNewTabPage = (url) => {
    return url === 'about:blank' || url === 'chrome://newtab/';
  };

  return (
    <AppContainer>
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={switchTab}
        onTabClose={closeTab}
        onNewTab={() => createNewTab()}
      />
      
      <AddressBar
        url={getActiveTab()?.url || ''}
        onNavigate={navigateToUrl}
        onBookmark={() => addBookmark({
          title: getActiveTab()?.title || '',
          url: getActiveTab()?.url || '',
          favicon: getActiveTab()?.favicon || ''
        })}
        onSidebarToggle={() => setSidebarVisible(!sidebarVisible)}
        onDownloadsToggle={() => setDownloadsVisible(!downloadsVisible)}
        onSettingsToggle={() => setSettingsVisible(!settingsVisible)}
      />

      <MainContent>
        {sidebarVisible && (
          <Sidebar
            bookmarks={bookmarks}
            history={history}
            onNavigate={navigateToUrl}
            onClose={() => setSidebarVisible(false)}
          />
        )}

        <ContentArea>
          <WebViewContainer>
            {isNewTabPage(getActiveTab()?.url) ? (
              <NewTabPage
                bookmarks={bookmarks}
                history={history}
                onNavigate={navigateToUrl}
                onBookmark={addBookmark}
              />
            ) : (
              <WebView
                url={getActiveTab()?.url || ''}
                isLoading={getActiveTab()?.isLoading || false}
              />
            )}
          </WebViewContainer>
        </ContentArea>
      </MainContent>

      {downloadsVisible && (
        <DownloadManager
          downloads={downloads}
          onClose={() => setDownloadsVisible(false)}
        />
      )}

      {settingsVisible && (
        <Settings
          onClose={() => setSettingsVisible(false)}
        />
      )}
    </AppContainer>
  );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
