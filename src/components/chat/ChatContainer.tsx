'use client';

import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/theme';
import { Header } from '../header';
import { MessageInput } from '../input/message';
import { UserMessage } from '../message/user';
import { CompanyMessage } from '../message/company';
import { LoadingMessage } from '../message/loading';
import { ChatBackground } from '../background/chat';
import { Message } from '../../types/chat';
import { ChatSetting } from '../../types/api';

interface ChatContainerProps {
  messages: Message[];
  chatSetting: ChatSetting | undefined;
  isLoading: boolean;
  error: any;
  showLoadingMessage: boolean;
  loadingMessageId: number | null;
  isCreatingConversation: boolean;
  isReplying: boolean;
  chatAreaRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage: (content: string) => void;
  onRating: (ratingType: 'good' | 'bad' | 'none') => void;
  onCloseChat: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  chatSetting,
  isLoading,
  error,
  showLoadingMessage,
  loadingMessageId,
  isCreatingConversation,
  isReplying,
  chatAreaRef,
  onSendMessage,
  onRating,
  onCloseChat,
}) => {
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
          backgroundColor={chatSetting?.window_bg_color || '#FFFFFF'}
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
              backgroundColor={chatSetting?.header_bg_color || '#FFFFFF'}
              onClose={onCloseChat}
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
                  <UserMessage 
                    message={message.content}
                    backgroundColor={chatSetting?.user_speech_bubble_color}
                  />
                ) : message.id === loadingMessageId && showLoadingMessage ? (
                  <LoadingMessage 
                    backgroundColor={chatSetting?.assistant_speech_bubble_color}
                    iconUrl={chatSetting?.assistant_icon_url}
                  />
                ) : (
                  <CompanyMessage 
                    message={message.content}
                    backgroundColor={chatSetting?.assistant_speech_bubble_color}
                    iconUrl={chatSetting?.assistant_icon_url}
                    ratingData={message.isRatingMessage && message.ratingData ? {
                      matchedMessage: message.ratingData.matchedMessage,
                      unmatchedMessage: message.ratingData.unmatchedMessage,
                      conversationState: message.ratingData.conversationState,
                      contactPageUrl: message.ratingData.contactPageUrl,
                      onRating: onRating
                    } : undefined}
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
              onSend={onSendMessage}
              isMicMode={false}
              disabled={isCreatingConversation || isReplying}
            />
            {(isCreatingConversation || isReplying) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'text.secondary'
                }}
              >
                <CircularProgress size={16} />
                {isCreatingConversation ? '送信中...' : '返信中...'}
              </Box>
            )}
          </Box>
        </ChatBackground>
      </Box>
    </ThemeProvider>
  );
};
