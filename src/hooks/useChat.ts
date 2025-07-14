'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getAccessToken, getChatSetting, createConversation, getConversation, replyToConversation } from '../lib/api';
import { getOrCreateFingerprint } from '../lib/fingerprint';
import { AccessTokenResponse, ChatSetting, Conversation } from '../types/api';
import { Message } from '../types/chat';

export const useChat = (identifier: string = 'livepass_test_chatui') => {
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
    ['access-token', identifier, deviceFingerprint],
    () => getAccessToken(identifier, deviceFingerprint),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 2. Chat設定取得
  const { data: chatSetting, error: settingError, isLoading: isSettingLoading } = useSWR<ChatSetting>(
    accessTokenData?.token ? ['chat-setting', identifier, accessTokenData.token] : null,
    () => getChatSetting(identifier, accessTokenData!.token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // 3. 会話作成のMutation
  const { trigger: createConversationTrigger, isMutating: isCreatingConversation } = useSWRMutation(
    accessTokenData?.token ? ['create-conversation', identifier] : null,
    async ([, identifierKey], { arg }: { arg: { content: string } }) => {
      return createConversation(identifierKey, arg.content, accessTokenData!.token);
    }
  );

  // 4. 会話情報取得のMutation
  const { trigger: fetchConversationTrigger } = useSWRMutation(
    accessTokenData?.token ? ['fetch-conversation', identifier] : null,
    async ([, identifierKey], { arg }: { arg: { token: string } }) => {
      return getConversation(identifierKey, arg.token, accessTokenData!.token);
    }
  );

  // 5. 返信のMutation
  const { trigger: replyToConversationTrigger, isMutating: isReplying } = useSWRMutation(
    accessTokenData?.token ? ['reply-conversation', identifier] : null,
    async ([, identifierKey], { arg }: { arg: { token: string; content: string } }) => {
      return replyToConversation(identifierKey, arg.token, arg.content, accessTokenData!.token);
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

  // SWRキーを明示的に生成
  const swrKey = useMemo(() => {
    if (currentConversation?.token && accessTokenData?.token) {
      return ['conversation', identifier, currentConversation.token, accessTokenData.token];
    }
    return null;
  }, [currentConversation?.token, accessTokenData?.token, identifier]);

  // 6. 会話情報取得（ポーリング用）
  const { data: conversationData, error: conversationError, isLoading: isConversationLoading, mutate: mutateConversation } = useSWR<Conversation>(
    swrKey,
    () => {
      console.log('[DEBUG] SWR Polling - Fetching conversation:', {
        conversationToken: currentConversation!.token,
        timestamp: new Date().toISOString(),
        isCloudFront: window.location.hostname.includes('cloudfront') || window.location.hostname.includes('amazonaws'),
        pageVisibility: document.visibilityState,
        networkOnline: navigator.onLine
      });
      return getConversation(identifier, currentConversation!.token, accessTokenData!.token);
    },
    {
      refreshInterval: () => {
        // ポーリング対象の状態の場合のみ2秒間隔でポーリング
        const shouldPoll = currentConversation?.token && accessTokenData?.token && 
          (currentConversation?.state === 'answer_preparing' || 
           currentConversation?.state === 'initial' || 
           currentConversation?.state === 'reply_received');
        console.log('[DEBUG] RefreshInterval check:', { shouldPoll, state: currentConversation?.state });
        return shouldPoll ? 2000 : 0;
      },
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

  // 強制ポーリング関数
  const forceStartPolling = useMemo(() => {
    return () => {
      if (swrKey) {
        console.log('[DEBUG] Force mutate with key:', swrKey);
        mutateConversation();
      } else {
        console.log('[DEBUG] Cannot mutate - no SWR key available');
      }
    };
  }, [swrKey, mutateConversation]);

  // currentConversationの状態変化を監視してポーリングを強制開始
  useEffect(() => {
    const shouldStartPolling = currentConversation?.token && accessTokenData?.token && 
      (currentConversation?.state === 'answer_preparing' || 
       currentConversation?.state === 'initial' || 
       currentConversation?.state === 'reply_received');
    
    if (shouldStartPolling) {
      console.log('[DEBUG] Force starting polling due to state change:', currentConversation?.state);
      forceStartPolling();
    }
  }, [currentConversation?.state, currentConversation?.token, accessTokenData?.token, forceStartPolling]);

  // SWRの状態変化をログ出力
  useEffect(() => {
    console.log('[DEBUG] SWR State:', {
      isConversationLoading,
      hasConversationData: !!conversationData,
      conversationError: conversationError instanceof Error ? conversationError.message : conversationError,
      timestamp: new Date().toISOString()
    });
  }, [isConversationLoading, conversationData, conversationError]);

  // ポーリング中かどうかを判定
  const isPolling = useMemo(() => {
    return currentConversation?.token && accessTokenData?.token && 
      (currentConversation?.state === 'answer_preparing' || 
       currentConversation?.state === 'initial' || 
       currentConversation?.state === 'reply_received');
  }, [currentConversation?.token, currentConversation?.state, accessTokenData?.token]);

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
    isPolling,
    createConversationTrigger,
    fetchConversationTrigger,
    replyToConversationTrigger,
    mutateConversation,
    forceStartPolling,
  };
};
