import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const NewTabContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LogoTitle = styled.h1`
  font-size: 48px;
  font-weight: 300;
  color: white;
  margin-bottom: 8px;
`;

const LogoSubtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 60px;
`;

const SearchBox = styled.div`
  position: relative;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 48px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #3c4043;
  background: transparent;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const SearchButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background: #f1f3f4;
  }
`;

const QuickAccess = styled.div`
  width: 100%;
  max-width: 800px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 16px;
  text-align: left;
`;

const BookmarksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
`;

const BookmarkItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const BookmarkIcon = styled.div`
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
  background: ${props => props.favicon ? `url(${props.favicon})` : '#fff'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 4px;
`;

const BookmarkTitle = styled.div`
  font-size: 12px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
`;

const HistoryItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const HistoryIcon = styled.div`
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
  background: ${props => props.favicon ? `url(${props.favicon})` : '#fff'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 4px;
`;

const HistoryTitle = styled.div`
  font-size: 12px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NewTabPage = ({ bookmarks, history, onNavigate, onBookmark }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(searchQuery);
    }
  };

  const handleBookmarkClick = (bookmark) => {
    onNavigate(bookmark.url);
  };

  const handleHistoryClick = (historyItem) => {
    onNavigate(historyItem.url);
  };

  const recentBookmarks = bookmarks.slice(0, 8);
  const recentHistory = history.slice(0, 8);

  return (
    <NewTabContainer>
      <Logo>
        <LogoTitle>Carbonate Browser</LogoTitle>
        <LogoSubtitle>Fast, secure, and modern browsing</LogoSubtitle>
      </Logo>

      <SearchContainer>
        <form onSubmit={handleSearch}>
          <SearchBox>
            <SearchInput
              type="text"
              placeholder="Search or type a URL"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton type="submit">
              🔍
            </SearchButton>
          </SearchBox>
        </form>
      </SearchContainer>

      <QuickAccess>
        {recentBookmarks.length > 0 && (
          <>
            <SectionTitle>Bookmarks</SectionTitle>
            <BookmarksGrid>
              {recentBookmarks.map(bookmark => (
                <BookmarkItem
                  key={bookmark.id}
                  onClick={() => handleBookmarkClick(bookmark)}
                >
                  <BookmarkIcon favicon={bookmark.favicon} />
                  <BookmarkTitle>{bookmark.title}</BookmarkTitle>
                </BookmarkItem>
              ))}
            </BookmarksGrid>
          </>
        )}

        {recentHistory.length > 0 && (
          <>
            <SectionTitle>Recent History</SectionTitle>
            <HistoryGrid>
              {recentHistory.map(historyItem => (
                <HistoryItem
                  key={historyItem.id}
                  onClick={() => handleHistoryClick(historyItem)}
                >
                  <HistoryIcon favicon={historyItem.favicon} />
                  <HistoryTitle>{historyItem.title}</HistoryTitle>
                </HistoryItem>
              ))}
            </HistoryGrid>
          </>
        )}
      </QuickAccess>
    </NewTabContainer>
  );
};

export default NewTabPage;
