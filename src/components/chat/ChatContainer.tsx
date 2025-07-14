'use client';

import React, { useEffect, useRef } from 'react';
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
  error: Error | null;
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
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastUserMessageId = useRef<number | null>(null);

  // メッセージ要素への参照を設定
  const setMessageRef = (messageId: number) => (el: HTMLDivElement | null) => {
    messageRefs.current[messageId] = el;
  };

  // 最新のユーザーメッセージIDを追跡
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.type === 'user');
    if (userMessages.length > 0) {
      const latestUserMessage = userMessages[userMessages.length - 1];
      lastUserMessageId.current = latestUserMessage.id;
    }
  }, [messages]);

  // 通常の自動スクロール（新着メッセージのステータスに基づく）
  useEffect(() => {
    if (messages.length === 0) return;

    // 最新のメッセージ（新着メッセージ）を取得
    const latestMessage = messages[messages.length - 1];
    
    // 最新メッセージが特定のステータスかチェック
    const latestMessageHasSpecificStatus = latestMessage.conversationStatus?.state && 
      ['top1', 'top3', 'unmatched'].includes(latestMessage.conversationStatus.state);

    if (latestMessageHasSpecificStatus) {
      
      // 最後のユーザーメッセージにスクロール
      if (lastUserMessageId.current && messageRefs.current[lastUserMessageId.current] && chatAreaRef.current) {
        const userMessageElement = messageRefs.current[lastUserMessageId.current];
        const chatArea = chatAreaRef.current;
        
        // userMessageElementがnullでないことを確認
        if (userMessageElement) {
          // ユーザーメッセージの位置を取得
          const userMessageTop = userMessageElement.offsetTop;
          
          // チャットエリアの上部にユーザーメッセージが来るようにスクロール
          chatArea.scrollTop = userMessageTop - 10; // 少し余白を持たせる
        }
      }
      return;
    }
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
  // ローディング中の表示
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
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
            width: '100%',
            height: '100%',
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
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        <ChatBackground 
          width="100%" 
          height="100%"
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
              <Box 
                key={message.id} 
                ref={setMessageRef(message.id)}
                sx={{ width: '100%', padding: '4px 8px' }}
              >
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10
            }}
          >
            <MessageInput
              placeholder="メッセージを入力してください..."
              onSend={onSendMessage}
              isMicMode={false}
              disabled={isCreatingConversation || isReplying}
              inline={true}
              backgroundColor={chatSetting?.assistant_speech_bubble_color}
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
