'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, Alert } from '@mui/material';
import useSWR from 'swr';
import { theme } from '../theme/theme';
import { Header } from '../components/header';
import { MessageInput } from '../components/input/message';
import { UserMessage } from '../components/message/user';
import { CompanyMessage } from '../components/message/company';
import { ChatBackground } from '../components/background/chat';
import { getAccessToken, getChatSetting } from '../lib/api';
import { AccessTokenResponse, ChatSetting } from '../types/api';

interface Message {
  id: number;
  type: 'user' | 'company';
  content: string;
  timestamp: Date;
}

// 定数
const IDENTIFIER = 'abe_test';
const FINGERPRINT = 'qwertyuiop';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  // 1. アクセストークン取得
  const { data: accessTokenData, error: tokenError, isLoading: isTokenLoading } = useSWR<AccessTokenResponse>(
    ['access-token', IDENTIFIER, FINGERPRINT],
    () => getAccessToken(IDENTIFIER, FINGERPRINT),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  // 2. Chat設定取得（アクセストークンが取得できた場合のみ）
  const { data: chatSetting, error: settingError, isLoading: isSettingLoading } = useSWR<ChatSetting>(
    accessTokenData?.token ? ['chat-setting', IDENTIFIER, accessTokenData.token] : null,
    () => getChatSetting(IDENTIFIER, accessTokenData!.token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  console.log('tokenError', tokenError)
  console.log('settingError', settingError)
  
  // ローディング状態とエラー状態の管理
  const isLoading = isTokenLoading || isSettingLoading;
  const error = tokenError || settingError;
  const isReady = !!(accessTokenData?.token && chatSetting);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Chat設定が取得できたら初期メッセージを表示
  useEffect(() => {
    if (chatSetting && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        type: 'company',
        content: chatSetting.welcome_message,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [chatSetting, messages.length]);

  // デバッグ用：取得したデータをコンソールに出力
  useEffect(() => {
    if (accessTokenData?.token) {
      console.log('Access Token:', accessTokenData.token);
    }
    if (chatSetting) {
      console.log('Chat Setting:', chatSetting);
    }
  }, [accessTokenData?.token, chatSetting]);

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

  // ローディング中の表示
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: '374px',
            height: '704px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress />
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
            チャット設定を読み込み中...
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: '374px',
            height: '704px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
          }}
        >
          <Alert severity="error">
            チャット設定の読み込みに失敗しました。
            <br />
            {error.message}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

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
        <ChatBackground 
          width={374} 
          height={704}
          primaryColor={chatSetting?.header_bg_color || theme.palette.brand.primary}
        >
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
              title={chatSetting?.header_label || "カスタマーサポート"}
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
                    color={theme.palette.brand.primary}
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
