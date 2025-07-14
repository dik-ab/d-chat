export interface Message {
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
  conversationStatus?: {
    state: 'initial' | 'answer_preparing' | 'reply_waiting' | 'reply_received' | 'top1' | 'top3' | 'unmatched' | 'failed' | 'final';
    token?: string;
    ratingTypeId?: number;
  };
}
