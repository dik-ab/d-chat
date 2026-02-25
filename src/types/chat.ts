export interface Message {
  id: number;
  type: 'user' | 'company' | 'rating' | 'separator' | 'options' | 'faq_tiles';
  content: string;
  timestamp: Date;
  isRatingMessage?: boolean;
  hideIcon?: boolean;
  ratingData?: {
    matchedMessage: string;
    unmatchedMessage: string;
    conversationState: 'top1' | 'top3' | 'unmatched';
    contactPageUrl?: string | null;
  };
  optionsData?: {
    questionId: number;
    answerId: number;
    options: Array<{
      id: number;
      content: string;
      simple_content: string;
    }>;
  };
  faqTilesData?: {
    faqs: Array<{
      question: string;
      answer: string;
      related_url?: string;
      score: number;
    }>;
  };
  conversationStatus?: {
    state: 'initial' | 'answer_preparing' | 'reply_waiting' | 'reply_received' | 'top1' | 'top3' | 'unmatched' | 'failed' | 'final';
    token?: string;
    ratingTypeId?: number;
  };
}
