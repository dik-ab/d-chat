// アクセストークン取得のレスポンス型
export interface AccessTokenResponse {
  token: string;
}

// アクセストークン取得のリクエスト型
export interface AccessTokenRequest {
  identifier: string;
  fingerprint: string;
}

// Chat設定情報の型
export interface ChatSetting {
  chat_icon_url: string;
  assistant_icon_url: string;
  user_speech_bubble_color: string;
  assistant_speech_bubble_color: string;
  header_bg_color: string;
  window_bg_color: string;
  header_label: string;
  welcome_message: string;
  matched_message: string;
  unmatched_message: string;
}

// 会話情報の型
export interface Question {
  id: number;
  content: string;
  answer?: {
    id: number;
    content: string;
    answer_type: 'top1_match' | 'top3_match' | 'additional' | 'unmatched';
  };
  rag_results?: Array<{
    question: string;
    answer: string;
    score: number;
  }>;
}

export interface Conversation {
  token: string;
  state: 'initial' | 'answer_preparing' | 'reply_waiting' | 'reply_received' | 'top1' | 'top3' | 'unmatched' | 'failed';
  rating_type_id: number; // 1: none, 2: good, 3: bad
  questions: Question[];
  contact_page_url: string | null;
}

// 返信リクエストの型
export interface ReplyRequest {
  token: string;
  identifier: string;
  content: string;
}

// API エラーの型
export interface ApiError {
  message: string;
  status?: number;
}
