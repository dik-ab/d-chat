'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '../hooks/useChat';
import { useMessageHandler } from '../hooks/useMessageHandler';
import { useChatActions } from '../hooks/useChatActions';
import { ChatContainer } from '../components/chat/ChatContainer';

function ChatPage() {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  
  // クエリパラメータからidentifierを取得
  const identifier = searchParams.get('identifier');
  
  // チャット関連のstate管理
  const chatState = useChat(identifier || 'livepass_test_chatui');
  
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
    forceStartPolling: chatState.forceStartPolling,
  });

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatState.messages]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
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
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
        <ChatContainer
          messages={[]}
          chatSetting={undefined}
          isLoading={true}
          error={null}
          showLoadingMessage={false}
          loadingMessageId={null}
          isCreatingConversation={false}
          isReplying={false}
          chatAreaRef={{ current: null }}
          onSendMessage={() => {}}
          onRating={() => {}}
          onCloseChat={() => {}}
        />
      </div>
    }>
      <ChatPage />
    </Suspense>
  );
}
