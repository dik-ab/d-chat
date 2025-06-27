'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { theme } from '../theme/theme';
import { Header } from '../components/header';
import { MessageInput } from '../components/input/message';
import { UserMessage } from '../components/message/user';
import { CompanyMessage } from '../components/message/company';
import { ChatBackground } from '../components/background/chat';

interface Message {
  id: number;
  type: 'user' | 'company';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // 簡単な自動返信（デモ用）
    setTimeout(() => {
      const autoReply: Message = {
        id: Date.now() + Math.random(), // より確実なユニークID
        type: 'company',
        content: 'ありがとうございます。担当者が確認いたします。少々お待ちください。',
        timestamp: new Date()
      };
      setMessages(current => [...current, autoReply]);
    }, 1000);
  };

  const handleCloseChat = () => {
    // 親ウィンドウにチャットを閉じる指示を送信
    if (window.parent) {
      window.parent.postMessage({ type: 'CLOSE_CHAT' }, '*');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '374px',
          height: '704px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        <ChatBackground width={374} height={704}>
          {/* ヘッダー */}
          <Box
            sx={{
              height: '58px',
              flexShrink: 0,
              zIndex: 10,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            <Header
              title="カスタマーサポート"
              onClose={handleCloseChat}
            />
          </Box>

          {/* チャットエリア */}
          <Box
            ref={chatAreaRef}
            sx={{
              position: 'absolute',
              top: '58px',
              left: 0,
              right: 0,
              bottom: '64px',
              overflowY: 'auto',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
            }}
          >
            {messages.map((message) => (
              <Box key={message.id} sx={{ width: '100%', padding: '4px 8px' }}>
                {message.type === 'user' ? (
                  <UserMessage message={message.content} />
                ) : (
                  <CompanyMessage 
                    message={message.content}
                    backgroundColor="#F0F0F0"
                    iconBackgroundColor="#C3E5E3"
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* メッセージ入力フォーム */}
          <Box
            sx={{
              height: '64px',
              flexShrink: 0,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10
            }}
          >
            <MessageInput
              placeholder="メッセージを入力してください..."
              onSend={handleSendMessage}
              isMicMode={false}
            />
          </Box>
        </ChatBackground>
      </Box>
    </ThemeProvider>
  );
}
