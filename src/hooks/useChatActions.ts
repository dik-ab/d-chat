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
  fetchConversationTrigger,
  replyToConversationTrigger,
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
      
      setCurrentConversation(conversation);
      
      // 会話作成/返信直後に明示的に会話情報を取得
      setTimeout(async () => {
        try {
          const updatedConversation = await fetchConversationTrigger({ token: conversation.token });
          
          if (updatedConversation.state === 'answer_preparing' || updatedConversation.state === 'initial') {
            setCurrentConversation(updatedConversation);
          } else if (updatedConversation.state === 'reply_waiting' || updatedConversation.questions.some(q => q.answer)) {
            setCurrentConversation(updatedConversation);
          } else {
            setCurrentConversation(updatedConversation);
          }
        } catch (fetchError) {
          console.error('Failed to fetch conversation after API call:', fetchError);
          setCurrentConversation(conversation);
        }
      }, 500);
      
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
      
    } catch (error) {
      console.error('Failed to send rating:', error);
    }
  };

  const handleCloseChat = () => {
    if (window.parent) {
      window.parent.postMessage({ type: 'CLOSE_CHAT' }, '*');
    }
  };

  return {
    handleSendMessage,
    handleRating,
    handleCloseChat,
  };
};
