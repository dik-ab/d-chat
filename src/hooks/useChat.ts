'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getAccessToken, getChatSetting, createConversation, getConversation, replyToConversation } from '../lib/api';
import { getOrCreateFingerprint } from '../lib/fingerprint';
import { AccessTokenResponse, ChatSetting, Conversation } from '../types/api';
import { Message } from '../types/chat';

const IDENTIFIER = 'livepass_test_chatui';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [processedQuestionIds, setProcessedQuestionIds] = useState<Set<number>>(new Set());
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState<number | null>(null);
  const [showRatingMessage, setShowRatingMessage] = useState(false);

  // デバイスフィンガープリント生成
  const deviceFingerprint = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'server-side';
    }
    
    try {
      const fingerprint = getOrCreateFingerprint();
      return fingerprint;
    } catch {
      return 'fallback_fingerprint';
    }
  }, []);

  // 1. アクセストークン取得
  const { data: accessTokenData, error: tokenError, isLoading: isTokenLoading } = useSWR<AccessTokenResponse>(
    ['access-token', IDENTIFIER, deviceFingerprint],
    () => getAccessToken(IDENTIFIER, deviceFingerprint),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 2. Chat設定取得
  const { data: chatSetting, error: settingError, isLoading: isSettingLoading } = useSWR<ChatSetting>(
    accessTokenData?.token ? ['chat-setting', IDENTIFIER, accessTokenData.token] : null,
    () => getChatSetting(IDENTIFIER, accessTokenData!.token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // 3. 会話作成のMutation
  const { trigger: createConversationTrigger, isMutating: isCreatingConversation } = useSWRMutation(
    accessTokenData?.token ? ['create-conversation', IDENTIFIER] : null,
    async ([, identifier], { arg }: { arg: { content: string } }) => {
      return createConversation(identifier, arg.content, accessTokenData!.token);
    }
  );

  // 4. 会話情報取得のMutation
  const { trigger: fetchConversationTrigger } = useSWRMutation(
    accessTokenData?.token ? ['fetch-conversation', IDENTIFIER] : null,
    async ([, identifier], { arg }: { arg: { token: string } }) => {
      return getConversation(identifier, arg.token, accessTokenData!.token);
    }
  );

  // 5. 返信のMutation
  const { trigger: replyToConversationTrigger, isMutating: isReplying } = useSWRMutation(
    accessTokenData?.token ? ['reply-conversation', IDENTIFIER] : null,
    async ([, identifier], { arg }: { arg: { token: string; content: string } }) => {
      return replyToConversation(identifier, arg.token, arg.content, accessTokenData!.token);
    }
  );

  // ポーリング条件のデバッグログ
  useEffect(() => {
    const shouldPoll = currentConversation?.token && accessTokenData?.token && 
      (currentConversation?.state === 'answer_preparing' || 
       currentConversation?.state === 'initial' || 
       currentConversation?.state === 'reply_received');
    
    console.log('[DEBUG] Polling conditions:', {
      hasConversationToken: !!currentConversation?.token,
      hasAccessToken: !!accessTokenData?.token,
      conversationState: currentConversation?.state,
      shouldPoll,
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      timestamp: new Date().toISOString()
    });
  }, [currentConversation, accessTokenData]);

  // CloudFrontでのポーリング問題調査用のタイマー監視
  useEffect(() => {
    let pollingTimer: NodeJS.Timeout | null = null;
    let pollingCount = 0;
    
    const shouldPoll = currentConversation?.token && accessTokenData?.token && 
      (currentConversation?.state === 'answer_preparing' || 
       currentConversation?.state === 'initial' || 
       currentConversation?.state === 'reply_received');
    
    if (shouldPoll) {
      console.log('[DEBUG] CloudFront Polling Monitor - Starting manual timer');
      pollingTimer = setInterval(() => {
        pollingCount++;
        console.log('[DEBUG] CloudFront Polling Monitor - Timer tick:', {
          count: pollingCount,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'
        });
      }, 2000);
    }
    
    return () => {
      if (pollingTimer) {
        console.log('[DEBUG] CloudFront Polling Monitor - Stopping timer');
        clearInterval(pollingTimer);
      }
    };
  }, [currentConversation?.token, accessTokenData?.token, currentConversation?.state]);

  // 6. 会話情報取得（ポーリング用）
  const { data: conversationData, error: conversationError, isLoading: isConversationLoading } = useSWR<Conversation>(
    currentConversation?.token && accessTokenData?.token && 
    (currentConversation?.state === 'answer_preparing' || currentConversation?.state === 'initial' || currentConversation?.state === 'reply_received')
      ? ['conversation', IDENTIFIER, currentConversation.token, accessTokenData.token] 
      : null,
    () => {
      console.log('[DEBUG] SWR Polling - Fetching conversation:', {
        conversationToken: currentConversation!.token,
        timestamp: new Date().toISOString(),
        isCloudFront: window.location.hostname.includes('cloudfront') || window.location.hostname.includes('amazonaws'),
        pageVisibility: document.visibilityState,
        networkOnline: navigator.onLine
      });
      return getConversation(IDENTIFIER, currentConversation!.token, accessTokenData!.token);
    },
    {
      refreshInterval: 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshWhenHidden: true,
      refreshWhenOffline: false,
      onSuccess: (data) => {
        console.log('[DEBUG] SWR Polling - Success:', {
          conversationState: data.state,
          questionsCount: data.questions?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        // 状態が変化した場合の詳細ログ
        if (currentConversation?.state !== data.state) {
          console.log('[DEBUG] State Transition:', {
            from: currentConversation?.state,
            to: data.state,
            timestamp: new Date().toISOString()
          });
        }
      },
      onError: (error) => {
        console.error('[DEBUG] SWR Polling - Error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }
  );

  // SWRの状態変化をログ出力
  useEffect(() => {
    console.log('[DEBUG] SWR State:', {
      isConversationLoading,
      hasConversationData: !!conversationData,
      conversationError: conversationError instanceof Error ? conversationError.message : conversationError,
      timestamp: new Date().toISOString()
    });
  }, [isConversationLoading, conversationData, conversationError]);

  const isLoading = isTokenLoading || isSettingLoading;
  const error = tokenError || settingError;

  return {
    messages,
    setMessages,
    currentConversation,
    setCurrentConversation,
    processedQuestionIds,
    setProcessedQuestionIds,
    showLoadingMessage,
    setShowLoadingMessage,
    loadingMessageId,
    setLoadingMessageId,
    showRatingMessage,
    setShowRatingMessage,
    accessTokenData,
    chatSetting,
    conversationData,
    isLoading,
    error,
    isCreatingConversation,
    isReplying,
    createConversationTrigger,
    fetchConversationTrigger,
    replyToConversationTrigger,
  };
};
