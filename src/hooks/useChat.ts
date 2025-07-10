'use client';

import { useState, useMemo } from 'react';
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

  // 6. 会話情報取得（ポーリング用）
  const { data: conversationData } = useSWR<Conversation>(
    currentConversation?.token && accessTokenData?.token && 
    (currentConversation?.state === 'answer_preparing' || currentConversation?.state === 'initial' || currentConversation?.state === 'reply_received')
      ? ['conversation', IDENTIFIER, currentConversation.token, accessTokenData.token] 
      : null,
    () => getConversation(IDENTIFIER, currentConversation!.token, accessTokenData!.token),
    {
      refreshInterval: 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

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
