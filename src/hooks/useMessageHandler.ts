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

  setMessages(prev => [...prev, firstMessage]);

  setTimeout(() => {
    // FAQタイルメッセージを作成
    const faqTilesMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'faq_tiles',
      content: '',
      timestamp: new Date(),
      faqTilesData: {
        faqs: question.rag_results!.slice(0, 3).map(result => ({
          question: result.question,
          answer: result.answer,
          related_url: result.related_url,
          score: result.score
        }))
      },
      conversationStatus: {
        state: currentConversation.state,
        token: currentConversation.token,
        ratingTypeId: currentConversation.rating_type_id
      }
    };

    setMessages(prev => [...prev, faqTilesMessage]);

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
    // スコアが0.7以上のRAG結果を全て取得
    const highScoreResults = question.rag_results!.filter(result => result.score >= 0.7);

    if (highScoreResults.length > 0) {
      // FAQタイルメッセージを作成
      const faqTilesMessage: Message = {
        id: Date.now() + Math.random(),
        type: 'faq_tiles',
        content: '',
        timestamp: new Date(),
        faqTilesData: {
          faqs: highScoreResults.map(result => ({
            question: result.question,
            answer: result.answer,
            related_url: result.related_url,
            score: result.score
          }))
        },
        conversationStatus: {
          state: currentConversation.state,
          token: currentConversation.token,
          ratingTypeId: currentConversation.rating_type_id
        }
      };

      setMessages(prev => [...prev, faqTilesMessage]);
    }

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
  _chatSetting: ChatSetting | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  _setShowRatingMessage: React.Dispatch<React.SetStateAction<boolean>>,
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
          questionId: question.id,
          answerId: question.answer!.id,
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
  
  // unmatchedの時も結果メッセージを表示する
  if (currentConversation.state === 'unmatched' && _chatSetting) {
    setTimeout(() => {
      addResultAndRatingMessages(currentConversation, _chatSetting, setMessages, _setShowRatingMessage);
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
      hideIcon: true,
      timestamp: new Date(),
      conversationStatus: {
        state: currentConversation.state,
        token: currentConversation.token,
        ratingTypeId: currentConversation.rating_type_id
      }
    };
    
    setMessages(prev => [...prev, resultMessageObj]);

    // unmatchedの時は評価メッセージを表示しないが、セパレーターメッセージは表示する
    if (currentConversation.state !== 'unmatched') {
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

        // セパレーターメッセージを自動で追加
        setTimeout(() => {
          const sessionSeparatorMessage: Message = {
            id: Date.now() + Math.random() + 3000,
            type: 'separator',
            content: 'ここから新しいチャット\n（会話内容は引き継がれません）',
            timestamp: new Date(),
            conversationStatus: {
              state: 'final',
              token: currentConversation.token,
              ratingTypeId: currentConversation.rating_type_id
            }
          };

          setMessages(prev => [...prev, sessionSeparatorMessage]);
        }, 500);
      }, 500);
    } else {
      // unmatchedの場合もセパレーターメッセージを表示
      setTimeout(() => {
        const sessionSeparatorMessage: Message = {
          id: Date.now() + Math.random() + 3000,
          type: 'separator',
          content: 'ここから新しいチャット\n（会話内容は引き継がれません）',
          timestamp: new Date(),
          conversationStatus: {
            state: 'final',
            token: currentConversation.token,
            ratingTypeId: currentConversation.rating_type_id
          }
        };

        setMessages(prev => [...prev, sessionSeparatorMessage]);
      }, 500);
    }
  }, 1000);
};
