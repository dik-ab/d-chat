'use client';

import { Message } from '@/types/chat';
import { rateConversation } from '../lib/api';
import { Conversation, AccessTokenResponse } from '../types/api';

const IDENTIFIER = 'livepass_test_chatui';

interface UseChatActionsProps {
  accessTokenData: AccessTokenResponse | undefined;
  currentConversation: Conversation | null;
  setCurrentConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showLoadingMessage: boolean;
  setShowLoadingMessage: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessageId: number | null;
  setLoadingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  isCreatingConversation: boolean;
  isReplying: boolean;
  createConversationTrigger: (arg: { content: string }) => Promise<Conversation>;
  fetchConversationTrigger: (arg: { token: string }) => Promise<Conversation>;
  replyToConversationTrigger: (arg: { token: string; content: string }) => Promise<Conversation>;
  forceStartPolling: () => void;
}

export const useChatActions = ({
  accessTokenData,
  currentConversation,
  setCurrentConversation,
  setMessages,
  showLoadingMessage,
  setShowLoadingMessage,
  loadingMessageId,
  setLoadingMessageId,
  isCreatingConversation,
  isReplying,
  createConversationTrigger,
  replyToConversationTrigger,
  forceStartPolling,
}: UseChatActionsProps) => {
  const handleSendMessage = async (content: string) => {
    if (!accessTokenData?.token || isCreatingConversation || isReplying) {
      return;
    }

    // ユーザーメッセージを即座に表示
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // ローディングメッセージを表示
    const loadingId = Date.now() + 1;
    const loadingMessage: Message = {
      id: loadingId,
      type: 'company',
      content: '',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setShowLoadingMessage(true);
    setLoadingMessageId(loadingId);

    try {
      let conversation: Conversation;

      // 現在の会話の状態に応じて適切なAPIを呼び出し
      if (!currentConversation) {
        conversation = await createConversationTrigger({ content });
      } else if (currentConversation.state === 'reply_waiting') {
        conversation = await replyToConversationTrigger({ 
          token: currentConversation.token, 
          content 
        });
      } else {
        conversation = await createConversationTrigger({ content });
      }
      
      // 返信送信の場合は、ポーリングを確実に開始するために状態を調整
      if (currentConversation && currentConversation.state === 'reply_waiting') {
        console.log('[DEBUG] Reply sent, forcing polling state');
        // 返信送信後は即座にポーリング状態にする
        setCurrentConversation({
          ...conversation,
          state: 'reply_received' // ポーリング条件に含まれる状態に設定
        });
        
        // 強制的にポーリングを開始
        setTimeout(() => {
          console.log('[DEBUG] Calling forceStartPolling after reply');
          forceStartPolling();
        }, 100);
      } else {
        setCurrentConversation(conversation);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // ローディングメッセージを削除
      if (showLoadingMessage && loadingMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
        setShowLoadingMessage(false);
        setLoadingMessageId(null);
      }
      
      // エラーメッセージを表示
      setTimeout(() => {
        const errorMessage: Message = {
          id: Date.now() + Math.random(),
          type: 'company',
          content: '申し訳ございません。一時的にサービスがご利用いただけません。しばらく経ってから再度お試しください。',
          timestamp: new Date()
        };
        setMessages(current => [...current, errorMessage]);
      }, 500);
    }
  };

  const handleRating = async (ratingType: 'good' | 'bad' | 'none') => {
    if (!currentConversation?.token || !accessTokenData?.token) {
      return;
    }

    try {
      // 評価タイプをAPIの形式に変換
      let ratingTypeId: number;
      switch (ratingType) {
        case 'good':
          ratingTypeId = 2;
          break;
        case 'bad':
          ratingTypeId = 3;
          break;
        case 'none':
        default:
          ratingTypeId = 1;
          break;
      }
      
      await rateConversation(
        IDENTIFIER,
        currentConversation.token,
        ratingTypeId,
        accessTokenData.token
      );
      
      // good または bad の評価の場合のみお礼メッセージを追加
      if (ratingType === 'good' || ratingType === 'bad') {
        const thankYouMessage: Message = {
          id: Date.now() + Math.random(),
          type: 'company',
          content: 'お問い合わせいただきありがとうございました。\nいただいた評価は品質の向上のために利用させていただきます。\n\n他にも質問がございましたら、再度メッセージの送信を行うことでチャットを開始することができます',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, thankYouMessage]);
      }
      
    } catch (error) {
      console.error('Failed to send rating:', error);
    }
  };

  const handleCloseChat = () => {
    if (window.parent) {
      window.parent.postMessage('qam-close', '*');
    }
  };

  return {
    handleSendMessage,
    handleRating,
    handleCloseChat,
  };
};
