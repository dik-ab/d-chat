import React, { useState, useRef, useEffect } from 'react';
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
  /** 色 */
  color?: string;
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
  color = '#1976d2',
}) => {
  const [hasRated, setHasRated] = useState(false);
  const hasCalledNoneRef = useRef(false);

  // 成功時（top1, top3）か失敗時（unmatched）かでメッセージを選択
  const resultMessage = conversationState === 'unmatched' ? unmatchedMessage : matchedMessage;

  // コンポーネントがアンマウントされる時にnone評価を送信
  useEffect(() => {
    return () => {
      if (!hasCalledNoneRef.current && !hasRated) {
        onRating('none');
      }
    };
  }, [hasRated, onRating]);

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
          color: '#FFFFFF',
          lineHeight: 1.5,
          marginBottom: contactPageUrl ? '12px' : '16px',
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
        <Box sx={{ marginBottom: '16px' }}>
          <Link
            href={contactPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#FFFFFF',
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
          color: '#FFFFFF',
          lineHeight: 1.5,
          marginBottom: '16px',
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 500,
        }}
      >
        お問合せいただきありがとうございました。品質向上のため、よろしければ以下のボタンから評価をお願いいたします。
      </Typography>

      {/* 評価ボタン */}
      {!hasRated && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <SurveyButton
            type="yes"
            onClick={() => handleRating('good')}
          />
          <SurveyButton
            type="no"
            onClick={() => handleRating('bad')}
          />
        </Box>
      )}

      {/* 評価完了メッセージ */}
      {hasRated && (
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
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
