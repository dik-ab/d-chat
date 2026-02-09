'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface Faq {
  question: string;
  answer: string;
  related_url?: string;
  score: number;
}

interface FaqTilesMessageProps {
  /** FAQ配列 */
  faqs: Faq[];
  /** アシスタントアイコンのURL */
  iconUrl?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** クラス名 */
  className?: string;
  /** URLクリックハンドラー */
  onUrlClick?: (url: string) => void;
}

const IconWrapper = styled(Box)(() => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  overflow: 'hidden',
  flexShrink: 0,
}));

const IconImage = styled('img')(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  width: '100%',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
  marginBottom: '8px',
}));

const MessageText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#FFFFFF',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  '& a': {
    color: '#FFFFFF',
    textDecoration: 'underline',
  },
}));

const Separator = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '18px',
  color: '#888888',
  textAlign: 'center',
  margin: '16px 0',
}));

/**
 * FAQタイルメッセージコンポーネント
 *
 * TOP1/TOP3の回答を表示します。
 */
export const FaqTilesMessage: React.FC<FaqTilesMessageProps> = ({
  faqs,
  iconUrl,
  backgroundColor = '#00A79E',
  className = '',
  onUrlClick,
}) => {
  const handleUrlClick = (url: string) => {
    if (onUrlClick) {
      onUrlClick(url);
    }
  };

  const parseMessageWithLinks = (text: string) => {
    const regex = /<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const url = match[1];
      const linkText = match[2];
      parts.push(
        <a
          key={match.index}
          href={url}
          onClick={() => handleUrlClick(url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {faqs.map((faq, index) => (
        <React.Fragment key={index}>
          {/* セパレーター */}
          <Separator>-----{index + 1}件目の回答-----</Separator>

          <Box sx={{ display: 'flex', gap: '8px' }}>
            {/* アイコン */}
            {iconUrl && (
              <IconWrapper>
                <IconImage src={iconUrl} alt="assistant" />
              </IconWrapper>
            )}

            {/* メッセージ */}
            <Box sx={{ flex: 1 }}>
              {/* 回答 */}
              <MessageBubble id={`faq-answer-${index}`} bgColor={backgroundColor}>
                <MessageText>{parseMessageWithLinks(faq.answer)}</MessageText>
              </MessageBubble>

              {/* 関連URL */}
              {faq.related_url && (
                <MessageBubble bgColor={backgroundColor}>
                  <MessageText>
                    {parseMessageWithLinks(
                      `操作や情報などを詳しく知りたい場合は<a href="${faq.related_url}" target="_blank">こちらのページ</a>をご確認ください。`
                    )}
                  </MessageText>
                </MessageBubble>
              )}
            </Box>
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default FaqTilesMessage;
