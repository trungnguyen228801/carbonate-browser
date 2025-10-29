import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DownloadManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: white;
  border-top: 1px solid #e1e5e9;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const DownloadHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DownloadTitle = styled.h3`
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

const DownloadList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const DownloadItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fff;
`;

const DownloadIcon = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 12px;
  background: #4285f4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const DownloadInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DownloadName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const DownloadProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: #f1f3f4;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #4285f4;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 12px;
  color: #5f6368;
  min-width: 60px;
  text-align: right;
`;

const DownloadStatus = styled.div`
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
`;

const DownloadActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #dadce0;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  color: #5f6368;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #4285f4;
    color: #4285f4;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #5f6368;
  font-size: 14px;
  padding: 40px 20px;
`;

const DownloadManager = ({ downloads, onClose }) => {
  const [localDownloads, setLocalDownloads] = useState(downloads);

  useEffect(() => {
    setLocalDownloads(downloads);
  }, [downloads]);

  const handlePause = async (downloadId) => {
    try {
      await window.electronAPI.pauseDownload(downloadId);
    } catch (error) {
      console.error('Failed to pause download:', error);
    }
  };

  const handleResume = async (downloadId) => {
    try {
      await window.electronAPI.resumeDownload(downloadId);
    } catch (error) {
      console.error('Failed to resume download:', error);
    }
  };

  const handleCancel = async (downloadId) => {
    try {
      await window.electronAPI.cancelDownload(downloadId);
    } catch (error) {
      console.error('Failed to cancel download:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond) => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const getStatusText = (download) => {
    switch (download.status) {
      case 'pending':
        return 'Waiting...';
      case 'downloading':
        return 'Downloading...';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#34a853';
      case 'error':
        return '#ea4335';
      case 'cancelled':
        return '#5f6368';
      default:
        return '#4285f4';
    }
  };

  if (localDownloads.length === 0) {
    return (
      <DownloadManagerContainer>
        <DownloadHeader>
          <DownloadTitle>Downloads</DownloadTitle>
          <CloseButton onClick={onClose}>
            ×
          </CloseButton>
        </DownloadHeader>
        <DownloadList>
          <EmptyState>
            No downloads yet.<br />
            Download some files to see them here.
          </EmptyState>
        </DownloadList>
      </DownloadManagerContainer>
    );
  }

  return (
    <DownloadManagerContainer>
      <DownloadHeader>
        <DownloadTitle>Downloads ({localDownloads.length})</DownloadTitle>
        <CloseButton onClick={onClose}>
          ×
        </CloseButton>
      </DownloadHeader>

      <DownloadList>
        {localDownloads.map(download => (
          <DownloadItem key={download.id}>
            <DownloadIcon>
              {download.status === 'completed' ? '✓' : '⬇'}
            </DownloadIcon>
            
            <DownloadInfo>
              <DownloadName>{download.filename}</DownloadName>
              
              <DownloadProgress>
                <ProgressBar>
                  <ProgressFill progress={download.progress || 0} />
                </ProgressBar>
                <ProgressText>
                  {download.status === 'downloading' && download.speed > 0
                    ? formatSpeed(download.speed)
                    : `${Math.round(download.progress || 0)}%`
                  }
                </ProgressText>
              </DownloadProgress>
              
              <DownloadStatus style={{ color: getStatusColor(download.status) }}>
                {getStatusText(download)}
              </DownloadStatus>
            </DownloadInfo>

            <DownloadActions>
              {download.status === 'downloading' && (
                <ActionButton onClick={() => handlePause(download.id)}>
                  Pause
                </ActionButton>
              )}
              
              {download.status === 'paused' && (
                <ActionButton onClick={() => handleResume(download.id)}>
                  Resume
                </ActionButton>
              )}
              
              {(download.status === 'downloading' || download.status === 'paused') && (
                <ActionButton onClick={() => handleCancel(download.id)}>
                  Cancel
                </ActionButton>
              )}
            </DownloadActions>
          </DownloadItem>
        ))}
      </DownloadList>
    </DownloadManagerContainer>
  );
};

export default DownloadManager;
