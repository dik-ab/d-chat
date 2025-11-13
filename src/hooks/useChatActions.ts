'use client';

import { Message } from '@/types/chat';
import { rateConversation, ApiErrorClass } from '../lib/api';
import { Conversation, AccessTokenResponse, ChatSetting } from '../types/api';

interface UseChatActionsProps {
  identifier: string;
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
  chatSetting: ChatSetting | undefined;
}

export const useChatActions = ({
  identifier,
  accessTokenData,
  currentConversation,
  setCurrentConversation,
  setMessages,
  setShowLoadingMessage,
  setLoadingMessageId,
  isCreatingConversation,
  isReplying,
  createConversationTrigger,
  replyToConversationTrigger,
  forceStartPolling,
  chatSetting,
}: UseChatActionsProps) => {
  const handleSendMessage = async (content: string) => {
    if (!accessTokenData?.token || isCreatingConversation || isReplying || chatSetting?.monthly_limit_exceeded) {
      return;
    }
    
    // chat_availableがfalseの場合の処理
    if (chatSetting && !chatSetting.chat_available) {
      const userMessage: Message = {
        id: Date.now(),
        type: 'user',
        content,
        timestamp: new Date(),
        conversationStatus: currentConversation ? {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        } : {
          state: 'initial'
        }
      };
      
      const busyMessage: Message = {
        id: Date.now() + 1,
        type: 'company',
        content: 'お問い合わせいただきありがとうございます。大変申し訳ありませんが、ただいま一時的にチャットの受付を停止しております。',
        timestamp: new Date(),
        conversationStatus: currentConversation ? {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        } : {
          state: 'initial'
        }
      };
      
      setMessages(prev => [...prev, userMessage, busyMessage]);
      return;
    }

    // ユーザーメッセージを即座に表示
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date(),
      conversationStatus: currentConversation ? {
        state: currentConversation.state,
        token: currentConversation.token,
        ratingTypeId: currentConversation.rating_type_id
      } : {
        state: 'initial'
      }
    };
    
    setMessages(prev => [...prev, userMessage]);

    // ローディングメッセージを表示
    const loadingId = Date.now() + 1;
    const loadingMessage: Message = {
      id: loadingId,
      type: 'company',
      content: '',
      timestamp: new Date(),
      conversationStatus: currentConversation ? {
        state: 'answer_preparing',
        token: currentConversation.token,
        ratingTypeId: currentConversation.rating_type_id
      } : {
        state: 'answer_preparing'
      }
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
      
      // ローディングメッセージを必ず削除
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
      setShowLoadingMessage(false);
      setLoadingMessageId(null);
      
      // エラーメッセージを表示
      setTimeout(() => {
        let errorContent = 'お問い合わせいただきありがとうございます。大変申し訳ありませんが、ただいま一時的にチャットの受付を停止しております。';
        
        // エラーの種類に応じてメッセージを設定
        if (error instanceof ApiErrorClass) {
          if (error.status === 422) {
            // 422エラーの詳細をレスポンスから判別
            const errorResponse = error.responseBody as { errors?: string[] };
            const errorMessage = errorResponse?.errors?.[0] || '';
            
            if (errorMessage.includes('monthly limit exceeded')) {
              // 月間会話上限 - 管理画面で設定されたメッセージを使用
              errorContent = chatSetting?.conversation_monthly_limit_message || '申し訳ございません。月間のご利用上限に達しました。来月以降に再度ご利用ください。';
            } else if (errorMessage.includes('chat unavailable')) {
              // チャット無効
              errorContent = 'お問い合わせいただきありがとうございます。大変申し訳ありませんが、ただいま一時的にチャットの受付を停止しております。';
            } else if (errorMessage.includes('inappropriate content')) {
              // NGワード・個人情報
              errorContent = 'ご入力内容に制限対象の語句が含まれています。表現を変えてもう一度お試しください。（複数回に渡って制限対象の語句の入力を検知すると、一時的にチャットがご利用いただけなくなります。何卒ご了承ください。）';
            } else {
              // デフォルトの422エラー
              errorContent = 'ご入力内容に制限対象の語句が含まれています。表現を変えてもう一度お試しください。（複数回に渡って制限対象の語句の入力を検知すると、一時的にチャットがご利用いただけなくなります。何卒ご了承ください。）';
            }
          } else if (error.status === 403) {
            // ブロックされたアクセス
            errorContent = '申し訳ございません。一時的にサービスがご利用いただけません。しばらく経ってから再度お試しください。';
          }
        }
        
        const errorMessage: Message = {
          id: Date.now() + Math.random(),
          type: 'company',
          content: errorContent,
          timestamp: new Date(),
          conversationStatus: {
            state: 'failed'
          }
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
        identifier,
        currentConversation.token,
        ratingTypeId,
        accessTokenData.token
      );
      
      // good または bad の評価の場合のみお礼メッセージを追加
      if (ratingType === 'good' || ratingType === 'bad') {
        const thankYouMessage: Message = {
          id: Date.now() + Math.random(),
          type: 'company',
          content: '評価いただきありがとうございました。\nいただいた評価は品質の向上のために利用させていただきます。\n\n他にも質問がございましたら、再度メッセージの送信を行うことでチャットを開始することができます',
          timestamp: new Date(),
          conversationStatus: {
            state: 'final',
            token: currentConversation.token,
            ratingTypeId: ratingTypeId
          }
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
