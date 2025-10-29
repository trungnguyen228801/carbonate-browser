import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const AddressBarContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  height: 48px;
  padding: 0 12px;
  gap: 8px;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: background-color 0.2s;

  &:hover {
    background: #f1f3f4;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddressInputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 24px;
  height: 36px;
  padding: 0 16px;
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-color: #4285f4;
  }
`;

const AddressInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #3c4043;
  background: transparent;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const SearchSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuggestionText = styled.span`
  flex: 1;
  color: #3c4043;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: background-color 0.2s;

  &:hover {
    background: #f1f3f4;
  }
`;

const AddressBar = ({ 
  url, 
  onNavigate, 
  onBookmark, 
  onSidebarToggle, 
  onDownloadsToggle, 
  onSettingsToggle 
}) => {
  const [inputValue, setInputValue] = useState(url);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 0) {
      // Generate suggestions based on input
      generateSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const generateSuggestions = (query) => {
    // Mock suggestions - in real app, this would come from history/bookmarks
    const mockSuggestions = [
      { type: 'search', text: `${query} - Google Search`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
      { type: 'search', text: `${query} - YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` },
      { type: 'search', text: `${query} - Wikipedia`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}` },
      { type: 'url', text: `https://www.${query}.com`, url: `https://www.${query}.com` },
    ];

    setSuggestions(mockSuggestions.slice(0, 5));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNavigate();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleNavigate = () => {
    setShowSuggestions(false);
    onNavigate(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.url);
    setShowSuggestions(false);
    onNavigate(suggestion.url);
  };

  const handleGoBack = () => {
    // Implement back navigation
    console.log('Go back');
  };

  const handleGoForward = () => {
    // Implement forward navigation
    console.log('Go forward');
  };

  const handleRefresh = () => {
    // Implement refresh
    console.log('Refresh');
  };

  const handleBookmark = () => {
    onBookmark();
  };

  return (
    <AddressBarContainer>
      <NavigationButtons>
        <NavButton onClick={handleGoBack} disabled={!canGoBack} title="Back">
          ←
        </NavButton>
        <NavButton onClick={handleGoForward} disabled={!canGoForward} title="Forward">
          →
        </NavButton>
        <NavButton onClick={handleRefresh} title="Refresh">
          ↻
        </NavButton>
      </NavigationButtons>

      <AddressInputContainer>
        <AddressInput
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Search or type a URL"
        />
        
        <SearchSuggestions visible={showSuggestions}>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <SuggestionIcon>
                {suggestion.type === 'search' ? '🔍' : '🌐'}
              </SuggestionIcon>
              <SuggestionText>{suggestion.text}</SuggestionText>
            </SuggestionItem>
          ))}
        </SearchSuggestions>
      </AddressInputContainer>

      <ActionButtons>
        <ActionButton onClick={handleBookmark} title="Bookmark this page">
          ⭐
        </ActionButton>
        <ActionButton onClick={onSidebarToggle} title="Sidebar">
          ☰
        </ActionButton>
        <ActionButton onClick={onDownloadsToggle} title="Downloads">
          ⬇
        </ActionButton>
        <ActionButton onClick={onSettingsToggle} title="Settings">
          ⚙
        </ActionButton>
      </ActionButtons>
    </AddressBarContainer>
  );
};

export default AddressBar;
