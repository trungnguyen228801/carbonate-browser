import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WebViewContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #5f6368;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  color: #3c4043;
`;

const ErrorDescription = styled.p`
  font-size: 14px;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #3367d6;
  }
`;

const WebView = ({ url, isLoading }) => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (url && url !== 'about:blank') {
      setError(null);
      setIsLoaded(false);
      
      // Simulate loading
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [url]);

  const handleRetry = () => {
    setError(null);
    setIsLoaded(false);
    
    // Simulate retry
    setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
  };

  if (error) {
    return (
      <WebViewContainer>
        <ErrorMessage>
          <ErrorTitle>This page can't be loaded</ErrorTitle>
          <ErrorDescription>
            The page at {url} might be temporarily down or it may have moved permanently to a new web address.
          </ErrorDescription>
          <RetryButton onClick={handleRetry}>
            Retry
          </RetryButton>
        </ErrorMessage>
      </WebViewContainer>
    );
  }

  if (isLoading || !isLoaded) {
    return (
      <WebViewContainer>
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      </WebViewContainer>
    );
  }

  // In a real implementation, this would be an actual webview
  // For now, we'll show a placeholder
  return (
    <WebViewContainer>
      <iframe
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        onError={() => setError(true)}
      />
    </WebViewContainer>
  );
};

export default WebView;
