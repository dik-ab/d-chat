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

            // 新しい質問が処理される時にshowRatingMessageをリセット
            if (showRatingMessage) {
              setShowRatingMessage(false);
            }

            if (currentConversation.state === 'top3' && question.answer.answer_type === 'top3_match' && question.rag_results && question.rag_results.length > 0) {
              handleTop3Response(question, currentConversation, chatSetting, setMessages, setShowRatingMessage);
            } else if (currentConversation.state === 'top1' && question.answer.answer_type === 'top1_match' && question.rag_results && question.rag_results.length >= 1) {
              handleTop1Response(question, currentConversation, chatSetting, setMessages, setShowRatingMessage);
            } else {
              handleNormalResponse(question, currentConversation, chatSetting, setMessages, setShowRatingMessage);
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
  
  const ragResults = question.rag_results.slice(0, 3);
  const ragMessages: Message[] = [];
  const separatorMessages: Message[] = [];
  
  ragResults.forEach((ragResult, index) => {
    // 2件目以降の回答の前に区切り線メッセージを追加
    if (index > 0) {
      separatorMessages.push({
        id: Date.now() + Math.random() + index * 100,
        type: 'separator' as const,
        content: `------ ${index + 1}件目の回答 ------`,
        timestamp: new Date(),
        conversationStatus: {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        }
      });
    }
    
    // 回答メッセージ
    ragMessages.push({
      id: Date.now() + Math.random() + index + 1,
      type: 'company' as const,
      content: ragResult.answer,
      timestamp: new Date(),
      conversationStatus: {
        state: currentConversation.state,
        token: currentConversation.token,
        ratingTypeId: currentConversation.rating_type_id
      }
    });
  });
  
  setMessages(prev => [...prev, firstMessage]);
  
  setTimeout(() => {
    // 区切り線と回答を交互に追加
    const allMessages: Message[] = [];
    ragMessages.forEach((ragMessage, index) => {
      if (index > 0 && separatorMessages[index - 1]) {
        allMessages.push(separatorMessages[index - 1]);
      }
      allMessages.push(ragMessage);
    });
    
    setMessages(prev => [...prev, ...allMessages]);
    
    // 各回答に対応するrelated_urlを処理
    const relatedUrlMessages: Message[] = [];
    ragResults.forEach((ragResult, index) => {
      if (ragResult.related_url && ragResult.related_url.trim() !== '') {
        relatedUrlMessages.push({
          id: Date.now() + Math.random() + 200 + index,
          type: 'company',
          content: `操作や情報などを詳しく知りたい場合は<a href="${ragResult.related_url}" target="_blank">こちらのページ</a>をご確認ください。`,
          timestamp: new Date(),
          conversationStatus: {
            state: currentConversation.state,
            token: currentConversation.token,
            ratingTypeId: currentConversation.rating_type_id
          }
        });
      }
    });
    
    if (relatedUrlMessages.length > 0) {
      setTimeout(() => {
        setMessages(prev => [...prev, ...relatedUrlMessages]);
        
        if (chatSetting) {
          addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
        }
      }, 300);
    } else {
      if (chatSetting) {
        addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
      }
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
    
    // related_urlがある場合はリンクメッセージを追加
    const validRelatedUrl = question.rag_results?.find(ragResult => ragResult.related_url && ragResult.related_url.trim() !== '')?.related_url;
    if (validRelatedUrl) {
      setTimeout(() => {
        const relatedUrlMessage: Message = {
          id: Date.now() + Math.random() + 100,
          type: 'company',
          content: `操作や情報などを詳しく知りたい場合は<a href="${validRelatedUrl}" target="_blank">こちらのページ</a>をご確認ください。`,
          timestamp: new Date(),
          conversationStatus: {
            state: currentConversation.state,
            token: currentConversation.token,
            ratingTypeId: currentConversation.rating_type_id
          }
        };
        
        setMessages(prev => [...prev, relatedUrlMessage]);
        
        if (chatSetting) {
          addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
        }
      }, 300);
    } else {
      if (chatSetting) {
        addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
      }
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
  
  if (currentConversation.state === 'unmatched' && chatSetting) {
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
