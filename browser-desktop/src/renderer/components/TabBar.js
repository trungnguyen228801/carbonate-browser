import React from 'react';
import styled from 'styled-components';

const TabBarContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  height: 40px;
  overflow-x: auto;
  overflow-y: hidden;
`;

const Tab = styled.div`
  display: flex;
  align-items: center;
  min-width: 200px;
  max-width: 300px;
  height: 100%;
  background: ${props => props.active ? '#fff' : 'transparent'};
  border-right: 1px solid #e1e5e9;
  cursor: pointer;
  position: relative;
  padding: 0 12px;
  user-select: none;

  &:hover {
    background: ${props => props.active ? '#fff' : '#f1f3f4'};
  }

  &:hover .tab-close {
    opacity: 1;
  }
`;

const TabFavicon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background: ${props => props.favicon ? `url(${props.favicon})` : '#ccc'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 2px;
`;

const TabTitle = styled.span`
  flex: 1;
  font-size: 13px;
  color: #3c4043;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

const TabClose = styled.button`
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;

  &:hover {
    background: #f1f3f4;
    color: #3c4043;
  }
`;

const NewTabButton = styled.button`
  width: 40px;
  height: 100%;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  border-right: 1px solid #e1e5e9;

  &:hover {
    background: #f1f3f4;
    color: #3c4043;
  }
`;

const TabBar = ({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }) => {
  const handleTabClick = (tabId) => {
    onTabClick(tabId);
  };

  const handleTabClose = (e, tabId) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  return (
    <TabBarContainer>
      {tabs.map(tab => (
        <Tab
          key={tab.id}
          active={tab.id === activeTabId}
          onClick={() => handleTabClick(tab.id)}
        >
          <TabFavicon favicon={tab.favicon} />
          <TabTitle>{tab.title || 'New Tab'}</TabTitle>
          <TabClose
            className="tab-close"
            onClick={(e) => handleTabClose(e, tab.id)}
          >
            ×
          </TabClose>
        </Tab>
      ))}
      <NewTabButton onClick={onNewTab}>
        +
      </NewTabButton>
    </TabBarContainer>
  );
};

export default TabBar;
