'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/theme';
import { ChatIcon } from '../../components/icon/chat';

export default function WidgetPage() {
  useEffect(() => {
    // bodyのスタイルを調整してスクロールを防ぐ
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = 'transparent';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.background = 'transparent';
    
    return () => {
      // クリーンアップ
      document.body.style.overflow = '';
      document.body.style.background = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.background = '';
    };
  }, []);
  const handleClose = (e?: React.MouseEvent) => {
    // イベントの伝播を停止
    if (e) {
      e.stopPropagation();
    }
    // 親ウィンドウにメッセージを送信
    if (window.parent) {
      window.parent.postMessage({ type: 'CLOSE_WIDGET' }, '*');
    }
  };

  const handleClick = () => {
    // 親ウィンドウにメッセージを送信
    if (window.parent) {
      window.parent.postMessage({ type: 'OPEN_CHAT' }, '*');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div 
        style={{ 
          width: '130px', 
          height: '160px',
          margin: 0,
          padding: 0,
          background: 'transparent',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleClick}
      >
        <ChatIcon onClose={handleClose} />
      </div>
    </ThemeProvider>
  );
}
