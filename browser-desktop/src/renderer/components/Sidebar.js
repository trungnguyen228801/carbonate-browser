import React, { useState } from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 300px;
  height: 100%;
  background: #f8f9fa;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 24px;
  height: 24px;
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

const SidebarTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e1e5e9;
`;

const SidebarTab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: ${props => props.active ? '#fff' : 'transparent'};
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.active ? '#4285f4' : '#5f6368'};
  border-bottom: 2px solid ${props => props.active ? '#4285f4' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#fff' : '#f1f3f4'};
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f1f3f4;
  }
`;

const ItemIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  background: ${props => props.favicon ? `url(${props.favicon})` : '#ccc'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 2px;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  color: #3c4043;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

const ItemUrl = styled.div`
  font-size: 12px;
  color: #5f6368;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #5f6368;
  font-size: 14px;
  padding: 40px 20px;
`;

const Sidebar = ({ bookmarks, history, onNavigate, onClose }) => {
  const [activeTab, setActiveTab] = useState('bookmarks');

  const handleItemClick = (item) => {
    onNavigate(item.url);
    onClose();
  };

  const renderBookmarks = () => {
    if (bookmarks.length === 0) {
      return (
        <EmptyState>
          No bookmarks yet.<br />
          Add some to see them here.
        </EmptyState>
      );
    }

    return (
      <ItemList>
        {bookmarks.map(bookmark => (
          <Item
            key={bookmark.id}
            onClick={() => handleItemClick(bookmark)}
          >
            <ItemIcon favicon={bookmark.favicon} />
            <ItemContent>
              <ItemTitle>{bookmark.title}</ItemTitle>
              <ItemUrl>{bookmark.url}</ItemUrl>
            </ItemContent>
          </Item>
        ))}
      </ItemList>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) {
      return (
        <EmptyState>
          No history yet.<br />
          Visit some websites to see them here.
        </EmptyState>
      );
    }

    return (
      <ItemList>
        {history.map(historyItem => (
          <Item
            key={historyItem.id}
            onClick={() => handleItemClick(historyItem)}
          >
            <ItemIcon favicon={historyItem.favicon} />
            <ItemContent>
              <ItemTitle>{historyItem.title}</ItemTitle>
              <ItemUrl>{historyItem.url}</ItemUrl>
            </ItemContent>
          </Item>
        ))}
      </ItemList>
    );
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>Sidebar</SidebarTitle>
        <CloseButton onClick={onClose}>
          ×
        </CloseButton>
      </SidebarHeader>

      <SidebarTabs>
        <SidebarTab
          active={activeTab === 'bookmarks'}
          onClick={() => setActiveTab('bookmarks')}
        >
          Bookmarks
        </SidebarTab>
        <SidebarTab
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          History
        </SidebarTab>
      </SidebarTabs>

      <SidebarContent>
        {activeTab === 'bookmarks' ? renderBookmarks() : renderHistory()}
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
