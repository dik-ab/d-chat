import React, { useState, useRef } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { SurveyButton } from '../../button/survey';

interface RatingMessageProps {
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
 * 評価メッセージコンポーネント
 * 
 * 回答終了後に表示される評価メッセージとボタンを含むコンポーネント
 */
export const RatingMessage: React.FC<RatingMessageProps> = ({
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

  const handleRating = (ratingType: 'good' | 'bad') => {
    if (hasRated) return;
    
    hasCalledNoneRef.current = true; // none送信を防ぐ
    setHasRated(true);
    onRating(ratingType);
  };
  
  return (
    <Box
      sx={{
        maxWidth: '280px',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px 12px 4px 12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        marginLeft: '8px',
        marginRight: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-8px',
          bottom: '8px',
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 8px 8px 0',
          borderColor: `transparent #ffffff transparent transparent`,
        },
      }}
    >
      {/* 結果メッセージ */}
      <Typography
        variant="body2"
        sx={{
          color: '#333333',
          lineHeight: 1.5,
          marginBottom: contactPageUrl ? '12px' : '16px',
          fontSize: '14px',
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
              color: color,
              textDecoration: 'none',
              fontSize: '14px',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            問い合わせページはこちら
          </Link>
        </Box>
      )}

      {/* 評価依頼メッセージ */}
      <Typography
        variant="body2"
        sx={{
          color: '#333333',
          lineHeight: 1.5,
          marginBottom: '16px',
          fontSize: '14px',
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
          variant="body2"
          sx={{
            color: '#666666',
            textAlign: 'center',
            fontSize: '14px',
            fontStyle: 'italic',
          }}
        >
          評価いただき、ありがとうございました。
        </Typography>
      )}
    </Box>
  );
};

export default RatingMessage;
