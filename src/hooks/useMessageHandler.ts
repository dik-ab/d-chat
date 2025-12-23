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
      // 月次制限に達している場合
      if (chatSetting.monthly_limit_exceeded) {
        const limitMessages: Message[] = [
          {
            id: Date.now(),
            type: 'company',
            content: chatSetting.conversation_monthly_limit_message,
            timestamp: new Date(),
            conversationStatus: {
              state: 'initial'
            }
          }
        ];
        
        // URLがある場合は追加
        if (chatSetting.conversation_monthly_limit_url) {
          limitMessages.push({
            id: Date.now() + 1,
            type: 'company',
            content: `<a href="${chatSetting.conversation_monthly_limit_url}" target="_blank">お問い合わせはこちら</a>`,
            timestamp: new Date(),
            conversationStatus: {
              state: 'initial'
            }
          });
        }
        
        setMessages(limitMessages);
      } else {
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
  const allMessages: Message[] = [];
  
  ragResults.forEach((ragResult, index) => {
    // 2件目以降の回答の前に区切り線メッセージを追加
    if (index > 0) {
      allMessages.push({
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
    allMessages.push({
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
    
    // related_urlがある場合は、その回答の直後にリンクメッセージを追加
    if (ragResult.related_url && ragResult.related_url.trim() !== '') {
      allMessages.push({
        id: Date.now() + Math.random() + index + 1000,
        type: 'company' as const,
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
  
  setMessages(prev => [...prev, firstMessage]);
  
  setTimeout(() => {
    setMessages(prev => [...prev, ...allMessages]);
    
    // 結果メッセージと評価メッセージを追加
    if (chatSetting) {
      setTimeout(() => {
        addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
      }, 300);
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
  
  setMessages(prev => [...prev, firstMessage]);
  
  setTimeout(() => {
    const messagesToAdd: Message[] = [];
    
    // スコアが0.7以上のRAG結果を全て表示
    const highScoreResults = question.rag_results!.filter(result => result.score >= 0.7);
    
    highScoreResults.forEach((result, index) => {
      const ragMessage: Message = {
        id: Date.now() + Math.random() + index + 1,
        type: 'company',
        content: result.answer,
        timestamp: new Date(),
        conversationStatus: {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        }
      };
      messagesToAdd.push(ragMessage);
      
      // related_urlがある場合はリンクメッセージを追加
      if (result.related_url && result.related_url.trim() !== '') {
        const relatedUrlMessage: Message = {
          id: Date.now() + Math.random() + index + 100,
          type: 'company',
          content: `操作や情報などを詳しく知りたい場合は<a href="${result.related_url}" target="_blank">こちらのページ</a>をご確認ください。`,
          timestamp: new Date(),
          conversationStatus: {
            state: currentConversation.state,
            token: currentConversation.token,
            ratingTypeId: currentConversation.rating_type_id
          }
        };
        messagesToAdd.push(relatedUrlMessage);
      }
    });
    
    setMessages(prev => [...prev, ...messagesToAdd]);
    
    // 結果メッセージと評価メッセージを追加
    if (chatSetting) {
      setTimeout(() => {
        addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
      }, 300);
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
  
  // unmatchedの場合はanswer.contentを表示しない
  if (currentConversation.state !== 'unmatched') {
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
  }
  
  // オプションがある場合は選択肢メッセージを追加
  if (question.answer.options && question.answer.options.length > 0) {
    setTimeout(() => {
      const optionsMessage: Message = {
        id: Date.now() + Math.random(),
        type: 'options',
        content: '',
        timestamp: new Date(),
        optionsData: {
          options: question.answer!.options!
        },
        conversationStatus: {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        }
      };
      setMessages(prev => [...prev, optionsMessage]);
    }, 300);
  }
  
  // unmatchedの時は評価メッセージを表示しない
  // if (currentConversation.state === 'unmatched' && chatSetting) {
  //   setTimeout(() => {
  //     addResultAndRatingMessages(currentConversation, chatSetting, setMessages, setShowRatingMessage);
  //   }, 1000);
  // }
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
    
    // お問い合わせIDを追加（固定文言の後に1行空けて表示）
    if (currentConversation.cid) {
      messageContent += `\n\n<span style="font-size: 12px; white-space: nowrap;">お問い合わせID: ${currentConversation.cid}</span>`;
    }
    
    // お問い合わせURLをその下に表示
    if (currentConversation.contact_page_url) {
      messageContent += `\n<a href="${currentConversation.contact_page_url}" target="_blank">問い合わせページはこちら</a>`;
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
