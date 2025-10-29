import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SettingsModal = styled.div`
  width: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const SettingsHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SettingsTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #3c4043;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #f1f3f4;
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const SettingsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  margin: 0 0 16px 0;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  flex: 1;
`;

const SettingName = styled.div`
  font-size: 14px;
  color: #3c4043;
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Toggle = styled.button`
  width: 44px;
  height: 24px;
  border: none;
  background: ${props => props.active ? '#4285f4' : '#dadce0'};
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const Select = styled.select`
  padding: 6px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #3c4043;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const Input = styled.input`
  padding: 6px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #3c4043;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: 1px solid #dadce0;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #3c4043;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #4285f4;
    color: #4285f4;
  }

  &.primary {
    background: #4285f4;
    color: white;
    border-color: #4285f4;

    &:hover {
      background: #3367d6;
    }
  }
`;

const Settings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    searchEngine: 'google',
    homepage: 'about:blank',
    autoLaunch: false,
    showBookmarks: true,
    showHistory: true,
    enableExtensions: true,
    blockAds: false,
    enableIncognito: true,
    enableDownloads: true,
    theme: 'light'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = {};
      for (const key of Object.keys(settings)) {
        const value = await window.electronAPI.getSetting(key);
        if (value !== null) {
          loadedSettings[key] = value;
        }
      }
      setSettings(prev => ({ ...prev, ...loadedSettings }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await window.electronAPI.setSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleToggle = (key) => {
    const newValue = !settings[key];
    saveSetting(key, newValue);
  };

  const handleSelect = (key, value) => {
    saveSetting(key, value);
  };

  const handleInput = (key, value) => {
    saveSetting(key, value);
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all browser data? This action cannot be undone.')) {
      try {
        await window.electronAPI.clearHistory();
        // Clear other data as needed
        alert('Browser data cleared successfully');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data');
      }
    }
  };

  return (
    <SettingsContainer onClick={onClose}>
      <SettingsModal onClick={(e) => e.stopPropagation()}>
        <SettingsHeader>
          <SettingsTitle>Settings</SettingsTitle>
          <CloseButton onClick={onClose}>
            ×
          </CloseButton>
        </SettingsHeader>

        <SettingsContent>
          <SettingsSection>
            <SectionTitle>General</SectionTitle>
            
            <SettingItem>
              <SettingLabel>
                <SettingName>Search Engine</SettingName>
                <SettingDescription>Choose your default search engine</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Select
                  value={settings.searchEngine}
                  onChange={(e) => handleSelect('searchEngine', e.target.value)}
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="duckduckgo">DuckDuckGo</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingName>Homepage</SettingName>
                <SettingDescription>Set your homepage URL</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Input
                  value={settings.homepage}
                  onChange={(e) => handleInput('homepage', e.target.value)}
                  placeholder="about:blank"
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingName>Theme</SettingName>
                <SettingDescription>Choose your preferred theme</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleSelect('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </Select>
              </SettingControl>
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>Privacy & Security</SectionTitle>
            
            <SettingItem>
              <SettingLabel>
                <SettingName>Block Ads</SettingName>
                <SettingDescription>Block advertisements and trackers</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Toggle
                  active={settings.blockAds}
                  onClick={() => handleToggle('blockAds')}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingName>Enable Incognito Mode</SettingName>
                <SettingDescription>Allow private browsing sessions</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Toggle
                  active={settings.enableIncognito}
                  onClick={() => handleToggle('enableIncognito')}
                />
              </SettingControl>
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>Features</SectionTitle>
            
            <SettingItem>
              <SettingLabel>
                <SettingName>Show Bookmarks</SettingName>
                <SettingDescription>Display bookmarks in the sidebar</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Toggle
                  active={settings.showBookmarks}
                  onClick={() => handleToggle('showBookmarks')}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingName>Show History</SettingName>
                <SettingDescription>Display browsing history in the sidebar</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Toggle
                  active={settings.showHistory}
                  onClick={() => handleToggle('showHistory')}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingName>Enable Extensions</SettingName>
                <SettingDescription>Allow browser extensions</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Toggle
                  active={settings.enableExtensions}
                  onClick={() => handleToggle('enableExtensions')}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingName>Enable Downloads</SettingName>
                <SettingDescription>Allow file downloads</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Toggle
                  active={settings.enableDownloads}
                  onClick={() => handleToggle('enableDownloads')}
                />
              </SettingControl>
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>Data</SectionTitle>
            
            <SettingItem>
              <SettingLabel>
                <SettingName>Clear Browser Data</SettingName>
                <SettingDescription>Clear all browsing data, history, and cookies</SettingDescription>
              </SettingLabel>
              <SettingControl>
                <Button onClick={handleClearData}>
                  Clear Data
                </Button>
              </SettingControl>
            </SettingItem>
          </SettingsSection>
        </SettingsContent>
      </SettingsModal>
    </SettingsContainer>
  );
};

export default Settings;
