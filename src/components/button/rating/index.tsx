import React, { useState, useRef } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { SurveyButton } from '../survey';

interface RatingButtonsProps {
  /** 成功時メッセージ（matched_message） */
  matchedMessage: string;
  /** 失敗時メッセージ（unmatched_message） */
  unmatchedMessage: string;
  /** 会話の状態 */
  conversationState: 'top1' | 'top3' | 'unmatched';
  /** 問い合わせページURL */
  contactPageUrl?: string | null;
  /** 評価ボタンクリック時のハンドラー */
  onRating: (ratingType: 'good' | 'bad' | 'none') => void;
  /** URLクリック時のトラッキング関数 */
  onUrlClick?: (url: string) => void;
}

/**
 * 評価ボタンコンポーネント
 * 
 * CompanyMessage内で使用される評価ボタンとメッセージを含むコンポーネント
 */
export const RatingButtons: React.FC<RatingButtonsProps> = ({
  matchedMessage,
  unmatchedMessage,
  conversationState,
  contactPageUrl,
  onRating,
  onUrlClick,
}) => {
  const [hasRated, setHasRated] = useState(false);
  const hasCalledNoneRef = useRef(false);

  // 成功時（top1, top3）か失敗時（unmatched）かでメッセージを選択
  const resultMessage = conversationState === 'unmatched' ? unmatchedMessage : matchedMessage;

  const handleRating = (ratingType: 'good' | 'bad') => {
    if (hasRated) return;
    
    hasCalledNoneRef.current = true; // none送信を防ぐ
    setHasRated(true);
    onRating(ratingType);
  };

  return (
    <Box>
      {/* 結果メッセージ */}
      <Typography
        sx={{
          color: '#333333',
          lineHeight: 1.5,
          marginBottom: contactPageUrl ? '8px' : '10px',
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 500,
          whiteSpace: 'pre-line',
        }}
      >
        {resultMessage}
      </Typography>

      {/* 問い合わせページリンク */}
      {contactPageUrl && (
        <Box sx={{ marginBottom: '10px' }}>
          <Link
            href={contactPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (onUrlClick) {
                onUrlClick(contactPageUrl);
              }
            }}
            sx={{
              color: '#1976D2',
              textDecoration: 'underline',
              fontSize: '14px',
              fontFamily: '"Noto Sans", sans-serif',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                opacity: 0.8,
              },
            }}
          >
            問い合わせページはこちら
          </Link>
        </Box>
      )}

      {/* 評価依頼メッセージ */}
      <Typography
        sx={{
          color: '#333333',
          lineHeight: 1.5,
          marginBottom: '8px',
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 500,
          marginTop: -1
        }}
      >
        お問合せいただきありがとうございました。サービス品質向上に向けた評価をお願いしております。表示された回答は参考になりましたか？
      </Typography>

      {/* 評価ボタン */}
      {!hasRated && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '-4px',
            '& img': {
              width: '100%',
              height: 'auto',
            },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SurveyButton
              type="yes"
              onClick={() => handleRating('good')}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SurveyButton
              type="no"
              onClick={() => handleRating('bad')}
            />
          </Box>
        </Box>
      )}

      {/* 評価完了メッセージ */}
      {hasRated && (
        <Typography
          sx={{
            color: '#888888',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: '"Noto Sans", sans-serif',
            fontWeight: 500,
            fontStyle: 'italic',
          }}
        >
          評価いただき、ありがとうございました。
        </Typography>
      )}
    </Box>
  );
};

export default RatingButtons;
