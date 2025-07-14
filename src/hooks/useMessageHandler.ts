'use client';

import { useEffect } from 'react';
import { Message } from '../types/chat';
import { Conversation, ChatSetting, Question } from '../types/api';

interface UseMessageHandlerProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentConversation: Conversation | null;
  conversationData: Conversation | undefined;
  setCurrentConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  processedQuestionIds: Set<number>;
  setProcessedQuestionIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  showLoadingMessage: boolean;
  setShowLoadingMessage: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessageId: number | null;
  setLoadingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  showRatingMessage: boolean;
  setShowRatingMessage: React.Dispatch<React.SetStateAction<boolean>>;
  chatSetting: ChatSetting | undefined;
}

export const useMessageHandler = ({
  messages,
  setMessages,
  currentConversation,
  conversationData,
  setCurrentConversation,
  processedQuestionIds,
  setProcessedQuestionIds,
  showLoadingMessage,
  setShowLoadingMessage,
  loadingMessageId,
  setLoadingMessageId,
  showRatingMessage,
  setShowRatingMessage,
  chatSetting,
}: UseMessageHandlerProps) => {
  // Chat設定が取得できたら初期メッセージを表示
  useEffect(() => {
    if (chatSetting && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        type: 'company',
        content: chatSetting.welcome_message,
        timestamp: new Date(),
        conversationStatus: {
          state: 'initial'
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [chatSetting, messages.length, setMessages]);

  // 会話データが更新されたら現在の会話を更新
  useEffect(() => {
    if (conversationData) {
      setCurrentConversation(conversationData);
    }
  }, [conversationData, setCurrentConversation]);

  // 会話データから新しいメッセージのみを追加
  useEffect(() => {
    if (currentConversation && currentConversation.questions.length > 0) {
      currentConversation.questions.forEach((question) => {
        if (!processedQuestionIds.has(question.id)) {
          if (question.answer) {
            // ローディングメッセージを削除
            if (showLoadingMessage && loadingMessageId) {
              setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
              setShowLoadingMessage(false);
              setLoadingMessageId(null);
            }

            if (currentConversation.state === 'top3' && question.answer.answer_type === 'top3_match' && question.rag_results && question.rag_results.length >= 3) {
              handleTop3Response(question, currentConversation, chatSetting, setMessages, setShowRatingMessage, showRatingMessage);
            } else if (currentConversation.state === 'top1' && question.rag_results && question.rag_results.length >= 1) {
              handleTop1Response(question, currentConversation, chatSetting, setMessages, setShowRatingMessage, showRatingMessage);
            } else {
              handleNormalResponse(question, currentConversation, chatSetting, setMessages, setShowRatingMessage, showRatingMessage);
            }
            
            setProcessedQuestionIds(prev => new Set([...prev, question.id]));
          }
        }
      });
    }
  }, [currentConversation, processedQuestionIds, showRatingMessage, showLoadingMessage, loadingMessageId, chatSetting, setMessages, setProcessedQuestionIds, setShowLoadingMessage, setLoadingMessageId, setShowRatingMessage]);
};

// Top3レスポンス処理
const handleTop3Response = (
  question: Question,
  currentConversation: Conversation,
  chatSetting: ChatSetting | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setShowRatingMessage: React.Dispatch<React.SetStateAction<boolean>>,
  showRatingMessage: boolean
) => {
  
  if (!question.answer || !question.rag_results) return;
  
  const firstMessage: Message = {
    id: Date.now() + Math.random(),
    type: 'company',
    content: question.answer.content,
    timestamp: new Date(),
    conversationStatus: {
      state: currentConversation.state,
      token: currentConversation.token,
      ratingTypeId: currentConversation.rating_type_id
    }
  };
  
  const ragMessages: Message[] = question.rag_results.slice(0, 3).map((ragResult, index: number) => ({
    id: Date.now() + Math.random() + index + 1,
    type: 'company' as const,
    content: ragResult.answer,
    timestamp: new Date(),
    conversationStatus: {
      state: currentConversation.state,
      token: currentConversation.token,
      ratingTypeId: currentConversation.rating_type_id
    }
  }));
  
  setMessages(prev => [...prev, firstMessage]);
  
  setTimeout(() => {
    setMessages(prev => [...prev, ...ragMessages]);
    
    if (!showRatingMessage && chatSetting) {
      addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
    }
  }, 500);
};

// Top1レスポンス処理
const handleTop1Response = (
  question: Question,
  currentConversation: Conversation,
  chatSetting: ChatSetting | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setShowRatingMessage: React.Dispatch<React.SetStateAction<boolean>>,
  showRatingMessage: boolean
) => {
  
  if (!question.answer || !question.rag_results || question.rag_results.length === 0) return;
  
  const firstMessage: Message = {
    id: Date.now() + Math.random(),
    type: 'company',
    content: question.answer.content,
    timestamp: new Date(),
    conversationStatus: {
      state: currentConversation.state,
      token: currentConversation.token,
      ratingTypeId: currentConversation.rating_type_id
    }
  };
  
  const ragMessage: Message = {
    id: Date.now() + Math.random() + 1,
    type: 'company',
    content: question.rag_results[0].answer,
    timestamp: new Date(),
    conversationStatus: {
      state: currentConversation.state,
      token: currentConversation.token,
      ratingTypeId: currentConversation.rating_type_id
    }
  };
  
  setMessages(prev => [...prev, firstMessage]);
  
  setTimeout(() => {
    setMessages(prev => [...prev, ragMessage]);
    
    if (!showRatingMessage && chatSetting) {
      addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
    }
  }, 500);
};

// 通常レスポンス処理
const handleNormalResponse = (
  question: Question,
  currentConversation: Conversation,
  chatSetting: ChatSetting | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setShowRatingMessage: React.Dispatch<React.SetStateAction<boolean>>,
  showRatingMessage: boolean
) => {
  if (!question.answer) return;
  
  const answerMessage: Message = {
    id: Date.now() + Math.random(),
    type: 'company',
    content: question.answer.content,
    timestamp: new Date(),
    conversationStatus: {
      state: currentConversation.state,
      token: currentConversation.token,
      ratingTypeId: currentConversation.rating_type_id
    }
  };
  
  setMessages(prev => [...prev, answerMessage]);
  
  if (currentConversation.state === 'unmatched' && !showRatingMessage && chatSetting) {
    setTimeout(() => {
      addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
    }, 1000);
  }
};

// 結果メッセージと評価メッセージを追加
const addResultAndRatingMessages = (
  currentConversation: Conversation,
  chatSetting: ChatSetting,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setShowRatingMessage: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setTimeout(() => {
    const resultMessage = currentConversation.state === 'unmatched' 
      ? chatSetting.unmatched_message 
      : chatSetting.matched_message;
    
    let messageContent = resultMessage;
    if (currentConversation.contact_page_url) {
      messageContent += `\n\n<a href="${currentConversation.contact_page_url}" target="_blank">問い合わせページはこちら</a>`;
    }
    
    const resultMessageObj: Message = {
      id: Date.now() + Math.random() + 1000,
      type: 'company',
      content: messageContent,
      timestamp: new Date(),
      conversationStatus: {
        state: currentConversation.state,
        token: currentConversation.token,
        ratingTypeId: currentConversation.rating_type_id
      }
    };
    
    setMessages(prev => [...prev, resultMessageObj]);
    
    setTimeout(() => {
      const ratingId = Date.now() + Math.random() + 2000;
      const ratingMessage: Message = {
        id: ratingId,
        type: 'company',
        content: '',
        timestamp: new Date(),
        isRatingMessage: true,
        ratingData: {
          matchedMessage: '',
          unmatchedMessage: '',
          conversationState: currentConversation.state as 'top1' | 'top3' | 'unmatched',
          contactPageUrl: null
        },
        conversationStatus: {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        }
      };
      
      setMessages(prev => [...prev, ratingMessage]);
      setShowRatingMessage(true);
    }, 500);
  }, 1000);
};
