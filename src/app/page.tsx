'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, Alert } from '@mui/material';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { theme } from '../theme/theme';
import { Header } from '../components/header';
import { MessageInput } from '../components/input/message';
import { UserMessage } from '../components/message/user';
import { CompanyMessage } from '../components/message/company';
import { LoadingMessage } from '../components/message/loading';
import { ChatBackground } from '../components/background/chat';
import { getAccessToken, getChatSetting, createConversation, getConversation, replyToConversation, rateConversation } from '../lib/api';
import { getOrCreateFingerprint } from '../lib/fingerprint';
import { AccessTokenResponse, ChatSetting, Conversation } from '../types/api';

interface Message {
  id: number;
  type: 'user' | 'company' | 'rating';
  content: string;
  timestamp: Date;
  isRatingMessage?: boolean;
  ratingData?: {
    matchedMessage: string;
    unmatchedMessage: string;
    conversationState: 'top1' | 'top3' | 'unmatched';
    contactPageUrl?: string | null;
  };
}

// 定数
const IDENTIFIER = 'livepass_test_chatui';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [processedQuestionIds, setProcessedQuestionIds] = useState<Set<number>>(new Set());
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState<number | null>(null);
  const [showRatingMessage, setShowRatingMessage] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  // デバイスフィンガープリント生成（同期的）
  const deviceFingerprint = useMemo(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') {
      return 'server_fallback';
    }
    
    try {
      const fingerprint = getOrCreateFingerprint();
      console.log('Generated device fingerprint:', fingerprint);
      return fingerprint;
    } catch (error) {
      console.error('Failed to generate fingerprint:', error);
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
  
  // 2. Chat設定取得（アクセストークンが取得できた場合のみ）
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

  // 4. 会話情報取得のMutation（明示的実行用）
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
      refreshInterval: 2000, // 2秒間隔でポーリング
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );
  
  // ローディング状態とエラー状態の管理
  const isLoading = isTokenLoading || isSettingLoading;
  const error = tokenError || settingError;

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Chat設定が取得できたら初期メッセージを表示
  useEffect(() => {
    if (chatSetting && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        type: 'company',
        content: chatSetting.welcome_message,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [chatSetting, messages.length]);

  // 会話データが更新されたら現在の会話を更新
  useEffect(() => {
    if (conversationData) {
      setCurrentConversation(conversationData);
    }
  }, [conversationData]);

  // 会話データから新しいメッセージのみを追加（既存メッセージを保持）
  useEffect(() => {
    if (currentConversation && currentConversation.questions.length > 0) {
      currentConversation.questions.forEach((question) => {
        // まだ処理していない質問の場合のみ処理
        if (!processedQuestionIds.has(question.id)) {
          // 回答がある場合のみメッセージを追加
          if (question.answer) {
            // ローディングメッセージを削除
            if (showLoadingMessage && loadingMessageId) {
              setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
              setShowLoadingMessage(false);
              setLoadingMessageId(null);
            }
            // top3状態の場合の特別処理
            if (currentConversation.state === 'top3' && question.answer.answer_type === 'top3_match' && question.rag_results && question.rag_results.length >= 3) {
              console.log('Processing top3 state with RAG results:', question.rag_results);
              
              // 1つ目: 通常の回答メッセージ
              const firstMessage: Message = {
                id: Date.now() + Math.random(),
                type: 'company',
                content: question.answer.content,
                timestamp: new Date()
              };
              
              // 2つ目と3つ目: RAG結果から上位3つの回答
              const ragMessages: Message[] = question.rag_results.slice(0, 3).map((ragResult, index) => ({
                id: Date.now() + Math.random() + index + 1,
                type: 'company' as const,
                content: ragResult.answer,
                timestamp: new Date()
              }));
              
              // 1つ目のメッセージを追加
              setMessages(prev => [...prev, firstMessage]);
              
              // 少し遅延させて2つ目と3つ目のメッセージを追加
              setTimeout(() => {
                setMessages(prev => [...prev, ...ragMessages]);
                
              // RAGメッセージ追加後に評価メッセージを表示
              if (!showRatingMessage && chatSetting) {
                setTimeout(() => {
                  // 1つ目: 成功/失敗メッセージ + 問い合わせリンク
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
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, resultMessageObj]);
                  
                  // 2つ目: 評価依頼メッセージ + 評価ボタン
                  setTimeout(() => {
                    const ratingId = Date.now() + Math.random() + 2000;
                    const ratingMessage: Message = {
                      id: ratingId,
                      type: 'company',
                      content: '', // CompanyMessageで表示するため空文字
                      timestamp: new Date(),
                      isRatingMessage: true,
                      ratingData: {
                        matchedMessage: '', // 空文字（既に表示済み）
                        unmatchedMessage: '', // 空文字（既に表示済み）
                        conversationState: currentConversation.state as 'top1' | 'top3' | 'unmatched',
                        contactPageUrl: null // null（既に表示済み）
                      }
                    };
                    
                    setMessages(prev => [...prev, ratingMessage]);
                    setShowRatingMessage(true);
                  }, 500); // 結果メッセージから0.5秒後に評価メッセージを表示
                }, 1000); // RAGメッセージ表示から1秒後に結果メッセージを表示
              }
              }, 500);
              
            } else if (currentConversation.state === 'top1' && question.rag_results && question.rag_results.length >= 1) {
              console.log('Processing top1 state with RAG results:', question.rag_results);
              
              // 1つ目: 通常の回答メッセージ
              const firstMessage: Message = {
                id: Date.now() + Math.random(),
                type: 'company',
                content: question.answer.content,
                timestamp: new Date()
              };
              
              // 2つ目: RAG結果から1つの回答
              const ragMessage: Message = {
                id: Date.now() + Math.random() + 1,
                type: 'company',
                content: question.rag_results[0].answer,
                timestamp: new Date()
              };
              
              // 1つ目のメッセージを追加
              setMessages(prev => [...prev, firstMessage]);
              
              // 少し遅延させて2つ目のメッセージを追加
              setTimeout(() => {
                setMessages(prev => [...prev, ragMessage]);
                
                // RAGメッセージ追加後に評価メッセージを表示
                if (!showRatingMessage && chatSetting) {
                  setTimeout(() => {
                    // 1つ目: 成功/失敗メッセージ + 問い合わせリンク
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
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, resultMessageObj]);
                    
                    // 2つ目: 評価依頼メッセージ + 評価ボタン
                    setTimeout(() => {
                      const ratingId = Date.now() + Math.random() + 2000;
                      const ratingMessage: Message = {
                        id: ratingId,
                        type: 'company',
                        content: '', // CompanyMessageで表示するため空文字
                        timestamp: new Date(),
                        isRatingMessage: true,
                        ratingData: {
                          matchedMessage: '', // 空文字（既に表示済み）
                          unmatchedMessage: '', // 空文字（既に表示済み）
                          conversationState: currentConversation.state as 'top1' | 'top3' | 'unmatched',
                          contactPageUrl: null // null（既に表示済み）
                        }
                      };
                      
                      setMessages(prev => [...prev, ratingMessage]);
                      setShowRatingMessage(true);
                    }, 500); // 結果メッセージから0.5秒後に評価メッセージを表示
                  }, 1000); // RAGメッセージ表示から1秒後に結果メッセージを表示
                }
              }, 500);
              
            } else {
              // 通常の処理
              const answerMessage: Message = {
                id: Date.now() + Math.random(),
                type: 'company',
                content: question.answer.content,
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, answerMessage]);
              
              // 通常の回答の場合は即座に評価メッセージを表示（unmatchedの場合）
              if (currentConversation.state === 'unmatched' && !showRatingMessage && chatSetting) {
                setTimeout(() => {
                  // 1つ目: 成功/失敗メッセージ + 問い合わせリンク
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
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, resultMessageObj]);
                  
                  // 2つ目: 評価依頼メッセージ + 評価ボタン
                  setTimeout(() => {
                    const ratingId = Date.now() + Math.random() + 2000;
                    const ratingMessage: Message = {
                      id: ratingId,
                      type: 'company',
                      content: '', // CompanyMessageで表示するため空文字
                      timestamp: new Date(),
                      isRatingMessage: true,
                      ratingData: {
                        matchedMessage: '', // 空文字（既に表示済み）
                        unmatchedMessage: '', // 空文字（既に表示済み）
                        conversationState: currentConversation.state as 'top1' | 'top3' | 'unmatched',
                        contactPageUrl: null // null（既に表示済み）
                      }
                    };
                    
                    setMessages(prev => [...prev, ratingMessage]);
                    setShowRatingMessage(true);
                  }, 500); // 結果メッセージから0.5秒後に評価メッセージを表示
                }, 1000); // 1秒後に結果メッセージを表示
              }
            }
            
            // 処理済みとしてマーク
            setProcessedQuestionIds(prev => new Set([...prev, question.id]));
          }
        }
      });
    }
  }, [currentConversation, processedQuestionIds, showRatingMessage]);

  // デバッグ用：取得したデータをコンソールに出力
  useEffect(() => {
    if (accessTokenData?.token) {
      console.log('Access Token:', accessTokenData.token);
    }
    if (chatSetting) {
      console.log('Chat Setting:', chatSetting);
    }
  }, [accessTokenData?.token, chatSetting]);

  // デバッグ用：現在の会話状態とポーリング条件を監視
  useEffect(() => {
    if (currentConversation) {
      console.log('Current conversation updated:', {
        token: currentConversation.token,
        state: currentConversation.state,
        questionsCount: currentConversation.questions.length,
        hasAnswers: currentConversation.questions.some(q => q.answer),
        shouldPoll: currentConversation.state === 'answer_preparing' || currentConversation.state === 'initial'
      });
    }
  }, [currentConversation]);

  // デバッグ用：ポーリングデータの更新を監視
  useEffect(() => {
    if (conversationData) {
      console.log('Polling data updated:', {
        token: conversationData.token,
        state: conversationData.state,
        questionsCount: conversationData.questions.length,
        hasAnswers: conversationData.questions.some(q => q.answer)
      });
    }
  }, [conversationData]);

  const handleSendMessage = async (content: string) => {
    if (!accessTokenData?.token || isCreatingConversation || isReplying) {
      return;
    }

    // 即座にユーザーメッセージを表示
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
      content: '', // LoadingMessageコンポーネントで表示するため空文字
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setShowLoadingMessage(true);
    setLoadingMessageId(loadingId);

    try {
      let conversation: Conversation;

      // 現在の会話の状態に応じて適切なAPIを呼び出し
      if (!currentConversation) {
        // 初回メッセージ：会話作成
        console.log('Creating new conversation with content:', content);
        conversation = await createConversationTrigger({ content });
        console.log('Created conversation:', conversation);
      } else if (currentConversation.state === 'reply_waiting') {
        // 返信待ち状態：返信API呼び出し
        console.log('Replying to conversation:', currentConversation.token, 'with content:', content);
        conversation = await replyToConversationTrigger({ 
          token: currentConversation.token, 
          content 
        });
        console.log('conversation', conversation)
        console.log('Reply sent, updated conversation:', conversation);
      } else {
        // その他の状態では新しい会話を作成（フォールバック）
        console.log('Current conversation state is:', currentConversation.state, 'Creating new conversation');
        conversation = await createConversationTrigger({ content });
        console.log('Created new conversation:', conversation);
      }
      
      // 作成/更新された会話を現在の会話として設定
      setCurrentConversation(conversation);
      
      // 会話作成/返信直後に明示的に会話情報を取得してステータスを確認
      setTimeout(async () => {
        try {
          const updatedConversation = await fetchConversationTrigger({ token: conversation.token });
          console.log('Fetched conversation after API call:', updatedConversation);
          
          // ステータスに応じて処理を分岐
          if (updatedConversation.state === 'answer_preparing' || updatedConversation.state === 'initial') {
            console.log('Starting polling for conversation:', updatedConversation.token);
            // ポーリング開始（useSWRが自動的に開始される）
            setCurrentConversation(updatedConversation);
          } else if (updatedConversation.state === 'reply_waiting' || updatedConversation.questions.some(q => q.answer)) {
            console.log('Answer ready or reply waiting, updating UI:', updatedConversation);
            // 即座に回答が準備されている場合やreply_waiting状態の場合はUIを更新
            setCurrentConversation(updatedConversation);
          } else {
            console.log('Conversation state:', updatedConversation.state, 'updating UI');
            setCurrentConversation(updatedConversation);
          }
        } catch (fetchError) {
          console.error('Failed to fetch conversation after API call:', fetchError);
          // フェッチに失敗した場合は取得した会話データを使用
          setCurrentConversation(conversation);
        }
      }, 500); // 500ms後に実行
      
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

      console.log('Sending rating:', { ratingType, ratingTypeId, token: currentConversation.token });
      
      await rateConversation(
        IDENTIFIER,
        currentConversation.token,
        ratingTypeId,
        accessTokenData.token
      );
      
      console.log('Rating sent successfully');
    } catch (error) {
      console.error('Failed to send rating:', error);
    }
  };

  const handleCloseChat = () => {
    // 親ウィンドウにチャットを閉じる指示を送信
    if (window.parent) {
      window.parent.postMessage({ type: 'CLOSE_CHAT' }, '*');
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: '374px',
            height: '704px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress />
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
            チャット設定を読み込み中...
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: '374px',
            height: '704px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
          }}
        >
          <Alert severity="error">
            チャット設定の読み込みに失敗しました。
            <br />
            {error.message}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '374px',
          height: '704px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        <ChatBackground 
          width={374} 
          height={704}
          primaryColor={chatSetting?.header_bg_color || theme.palette.brand.primary}
        >
          {/* ヘッダー */}
          <Box
            sx={{
              height: '58px',
              flexShrink: 0,
              zIndex: 10,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            <Header
              title={chatSetting?.header_label || "カスタマーサポート"}
              onClose={handleCloseChat}
            />
          </Box>

          {/* チャットエリア */}
          <Box
            ref={chatAreaRef}
            sx={{
              position: 'absolute',
              top: '58px',
              left: 0,
              right: 0,
              bottom: '64px',
              overflowY: 'auto',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
            }}
          >
            {messages.map((message) => (
              <Box key={message.id} sx={{ width: '100%', padding: '4px 8px' }}>
                {message.type === 'user' ? (
                  <UserMessage message={message.content} />
                ) : message.id === loadingMessageId && showLoadingMessage ? (
                  <LoadingMessage 
                    color={theme.palette.brand.primary}
                  />
                ) : (
                  <CompanyMessage 
                    message={message.content}
                    color={theme.palette.brand.primary}
                    ratingData={message.isRatingMessage && message.ratingData ? {
                      matchedMessage: message.ratingData.matchedMessage,
                      unmatchedMessage: message.ratingData.unmatchedMessage,
                      conversationState: message.ratingData.conversationState,
                      contactPageUrl: message.ratingData.contactPageUrl,
                      onRating: handleRating
                    } : undefined}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* メッセージ入力フォーム */}
          <Box
            sx={{
              height: '64px',
              flexShrink: 0,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10
            }}
          >
            <MessageInput
              placeholder="メッセージを入力してください..."
              onSend={handleSendMessage}
              isMicMode={false}
              disabled={isCreatingConversation || isReplying}
            />
            {(isCreatingConversation || isReplying) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'text.secondary'
                }}
              >
                <CircularProgress size={16} />
                {isCreatingConversation ? '送信中...' : '返信中...'}
              </Box>
            )}
          </Box>
        </ChatBackground>
      </Box>
    </ThemeProvider>
  );
}
