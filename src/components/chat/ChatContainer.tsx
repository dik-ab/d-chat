'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/theme';
import { Header } from '../header';
import { MessageInput, MessageInputRef } from '../input/message';
import { UserMessage } from '../message/user';
import { CompanyMessage } from '../message/company';
import { LoadingMessage } from '../message/loading';
import { SeparatorMessage } from '../message/separator';
import { OptionsMessage } from '../message/options';
import { FaqTilesMessage } from '../message/faq-tiles';
import { ChatBackground } from '../background/chat';
import { VideoBackground } from '../background/video';
import { Message } from '../../types/chat';
import { ChatSetting, Conversation } from '../../types/api';

interface ChatContainerProps {
  messages: Message[];
  chatSetting: ChatSetting | undefined;
  isLoading: boolean;
  error: Error | null;
  showLoadingMessage: boolean;
  loadingMessageId: number | null;
  isCreatingConversation: boolean;
  isReplying: boolean;
  isPolling: boolean;
  currentConversation: Conversation | null
  chatAreaRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage: (content: string) => void;
  onRating: (ratingType: 'good' | 'bad' | 'none') => void;
  onCloseChat: () => void;
  onUrlClick?: (url: string) => void;
  onOptionSelect?: (questionId: number, optionId: number) => void;
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
  isPolling,
  currentConversation,
  chatAreaRef,
  onSendMessage,
  onRating,
  onCloseChat,
  onUrlClick,
  onOptionSelect,
}) => {
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastUserMessageId = useRef<number | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const [hasInputError, setHasInputError] = useState(false);

  // ユーザーメッセージが存在するかチェック
  const hasUserMessage = messages.some(msg => msg.type === 'user');

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

  // メッセージ送信ハンドラー（フォーカスを戻す処理を追加）
  const handleSendMessage = (content: string) => {
    onSendMessage(content);
    // メッセージ送信後にフォーカスを戻す
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  // オプションがクリックされた時のハンドラー
  const handleOptionClick = (content: string, optionId: number, questionId: number) => {
    // 選択肢のトラッキングAPIを呼び出す
    if (onOptionSelect) {
      onOptionSelect(questionId, optionId);
    }

    if (messageInputRef.current && messageInputRef.current.textAreaRef) {
      const textArea = messageInputRef.current.textAreaRef;
      const start = textArea.selectionStart || 0;
      const end = textArea.selectionEnd || 0;
      const currentValue = messageInputRef.current.getValue();

      // 内容に「。」を追加（すでに「。」で終わっていない場合のみ）
      const contentWithPeriod = content.endsWith('。') ? content : content + '。';

      // カーソル位置に挿入
      const newValue = currentValue.substring(0, start) + contentWithPeriod + currentValue.substring(end);
      messageInputRef.current.setValue(newValue);

      // カーソル位置を更新
      setTimeout(() => {
        textArea.selectionStart = textArea.selectionEnd = start + contentWithPeriod.length;
        messageInputRef.current?.focus();
      }, 0);
    }
  };

  // reply_waiting状態になったときに自動フォーカス
  useEffect(() => {
    if (currentConversation?.state === 'reply_waiting') {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 200); // 少し長めの遅延でDOM更新を待つ
    }
  }, [currentConversation?.state]);

  // 通常の自動スクロール（新着メッセージのステータスに基づく）
  useEffect(() => {
    if (messages.length === 0) return;

    // 最新のメッセージ（新着メッセージ）を取得
    const latestMessage = messages[messages.length - 1];

    // 最後のメッセージIDが変わっていない場合はスクロールしない
    // （評価ボタン押下時に、セパレーターの前にお礼メッセージが挿入される場合など）
    if (lastMessageIdRef.current === latestMessage.id) {
      return;
    }

    // 最後のメッセージIDを更新
    lastMessageIdRef.current = latestMessage.id;

    // 最新メッセージが特定のステータスかチェック
    const latestMessageHasSpecificStatus = latestMessage.conversationStatus?.state &&
      ['top1', 'top3', 'unmatched'].includes(latestMessage.conversationStatus.state);

    // 更問い状態かチェック（reply_waiting状態、またはoptionsメッセージがある場合）
    const isReplyWaiting = currentConversation?.state === 'reply_waiting' ||
                          (latestMessage.type === 'options' && latestMessage.optionsData);

    // セパレーターメッセージの場合はスクロールしない（位置を維持）
    const isSeparatorMessage = latestMessage.type === 'separator';

    if (latestMessageHasSpecificStatus || isReplyWaiting || isSeparatorMessage) {

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
  }, [messages, currentConversation?.state]);
  // ローディング中の表示
  if (isLoading || !chatSetting) {
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

  // 動画オーバーレイの表示判定（月間上限に達している場合は表示しない）
  const showVideoOverlay = !hasUserMessage && !chatSetting.monthly_limit_exceeded && chatSetting.bg_movie_url && chatSetting.bg_movie_bubble_message;

  // 動画表示モードの場合は、専用のレイアウトを返す
  if (showVideoOverlay) {
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

          {/* 動画背景 */}
          <VideoBackground
            videoUrl={chatSetting.bg_movie_url!}
            bubbleMessage={chatSetting.bg_movie_bubble_message!}
          />

          {/* メッセージ入力フォーム */}
          <Box
            sx={{
              minHeight: '64px',
              height: 'auto',
              flexShrink: 0,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E0E0E0',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <MessageInput 
              ref={messageInputRef}
              onSend={handleSendMessage}
              disabled={isCreatingConversation || isReplying}
              backgroundColor={chatSetting?.assistant_speech_bubble_color}
              onErrorStateChange={setHasInputError}
            />
            {(isCreatingConversation || isReplying) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary',
                  fontSize: '14px'
                }}
              >
                <CircularProgress size={16} />
                {isCreatingConversation ? '送信中...' : '返信中...'}
              </Box>
            )}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // 通常のチャット表示
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
                top: {
                  xs: '58px', // モバイル・小画面
                  sm: '58px', // タブレット
                  md: '80px', // デスクトップ中
                  lg: '100px', // デスクトップ大
                },
                left: 0,
                right: 0,
                bottom: hasInputError ? '84px' : '64px', // エラー時は高さを増やす
                overflowY: 'auto',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                transition: 'bottom 0.2s ease-in-out',
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <UserMessage 
                      message={message.content}
                      backgroundColor={chatSetting?.user_speech_bubble_color}
                    />
                  </Box>
                ) : message.type === 'separator' ? (
                  <SeparatorMessage 
                    message={message}
                  />
                ) : message.id === loadingMessageId && showLoadingMessage ? (
                  <LoadingMessage 
                    backgroundColor={chatSetting?.assistant_speech_bubble_color}
                    iconUrl={chatSetting?.assistant_icon_url}
                  />
                ) : message.type === 'options' && message.optionsData ? (
                  <OptionsMessage
                    options={message.optionsData.options}
                    questionId={message.optionsData.questionId}
                    answerId={message.optionsData.answerId}
                    onOptionClick={handleOptionClick}
                    iconUrl={chatSetting?.assistant_icon_url}
                    backgroundColor={chatSetting?.assistant_speech_bubble_color}
                    disabled={isCreatingConversation || isReplying}
                  />
                ) : message.type === 'faq_tiles' && message.faqTilesData ? (
                  <FaqTilesMessage
                    faqs={message.faqTilesData.faqs}
                    iconUrl={chatSetting?.assistant_icon_url}
                    backgroundColor={chatSetting?.assistant_speech_bubble_color}
                    onUrlClick={onUrlClick}
                  />
                ) : (
                  <Box sx={{ 
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start'
                  }}>
                    <Box sx={{ 
                      maxWidth: message.isRatingMessage && message.ratingData ? '320px' : '100%',
                      width: message.isRatingMessage && message.ratingData ? '320px' : 'auto'
                    }}>
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
                        onUrlClick={onUrlClick}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
            </Box>

          {/* メッセージ入力フォーム */}
          <Box
            sx={{
              minHeight: '64px',
              height: 'auto',
              flexShrink: 0,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10,
            }}
          >
            <MessageInput
              ref={messageInputRef}
              placeholder="メッセージを入力してください..."
              onSend={handleSendMessage}
              isMicMode={false}
              disabled={isCreatingConversation || isReplying || isPolling || chatSetting?.monthly_limit_exceeded}
              inline={true}
              backgroundColor={chatSetting?.assistant_speech_bubble_color}
              onErrorStateChange={setHasInputError}
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
