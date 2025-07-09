'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useMessageHandler } from '../hooks/useMessageHandler';
import { useChatActions } from '../hooks/useChatActions';
import { ChatContainer } from '../components/chat/ChatContainer';

export default function Home() {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  // チャット関連のstate管理
  const chatState = useChat();
  
  // メッセージ処理
  useMessageHandler({
    messages: chatState.messages,
    setMessages: chatState.setMessages,
    currentConversation: chatState.currentConversation,
    conversationData: chatState.conversationData,
    setCurrentConversation: chatState.setCurrentConversation,
    processedQuestionIds: chatState.processedQuestionIds,
    setProcessedQuestionIds: chatState.setProcessedQuestionIds,
    showLoadingMessage: chatState.showLoadingMessage,
    setShowLoadingMessage: chatState.setShowLoadingMessage,
    loadingMessageId: chatState.loadingMessageId,
    setLoadingMessageId: chatState.setLoadingMessageId,
    showRatingMessage: chatState.showRatingMessage,
    setShowRatingMessage: chatState.setShowRatingMessage,
    chatSetting: chatState.chatSetting,
  });
  
  // チャットアクション
  const { handleSendMessage, handleRating, handleCloseChat } = useChatActions({
    accessTokenData: chatState.accessTokenData,
    currentConversation: chatState.currentConversation,
    setCurrentConversation: chatState.setCurrentConversation,
    setMessages: chatState.setMessages,
    showLoadingMessage: chatState.showLoadingMessage,
    setShowLoadingMessage: chatState.setShowLoadingMessage,
    loadingMessageId: chatState.loadingMessageId,
    setLoadingMessageId: chatState.setLoadingMessageId,
    isCreatingConversation: chatState.isCreatingConversation,
    isReplying: chatState.isReplying,
    createConversationTrigger: chatState.createConversationTrigger,
    fetchConversationTrigger: chatState.fetchConversationTrigger,
    replyToConversationTrigger: chatState.replyToConversationTrigger,
  });

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatState.messages]);

  // デバッグ用ログ
  useEffect(() => {
    if (chatState.accessTokenData?.token) {
      console.log('Access Token:', chatState.accessTokenData.token);
    }
    if (chatState.chatSetting) {
      console.log('Chat Setting:', chatState.chatSetting);
    }
  }, [chatState.accessTokenData?.token, chatState.chatSetting]);

  return (
    <ChatContainer
      messages={chatState.messages}
      chatSetting={chatState.chatSetting}
      isLoading={chatState.isLoading}
      error={chatState.error}
      showLoadingMessage={chatState.showLoadingMessage}
      loadingMessageId={chatState.loadingMessageId}
      isCreatingConversation={chatState.isCreatingConversation}
      isReplying={chatState.isReplying}
      chatAreaRef={chatAreaRef}
      onSendMessage={handleSendMessage}
      onRating={handleRating}
      onCloseChat={handleCloseChat}
    />
  );
}
