'use client';

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

const MessageBubble = styled(Box)(() => ({
  width: '100%',
  boxSizing: 'border-box',
  marginBottom: '8px',
}));

const MessageText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#333333',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  '& a': {
    color: '#1976D2',
    textDecoration: 'underline',
  },
}));

const RichHtmlContent = styled(Box)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#333333',
  wordBreak: 'break-word',
  '& p': { margin: '0 0 8px 0', '&:last-child': { marginBottom: 0 } },
  '& h3': { fontSize: '14px', fontWeight: 700, margin: '12px 0 8px 0' },
  '& ul': { margin: '4px 0 8px 0', paddingLeft: '20px', listStyleType: 'disc' },
  '& ol': { margin: '4px 0 8px 0', paddingLeft: '20px', listStyleType: 'decimal' },
  '& li': { marginBottom: '4px', '& ol': { marginTop: '4px' } },
  '& strong': { fontWeight: 700 },
  '& hr': { border: 'none', borderTop: '1px solid #E0E0E0', margin: '12px 0' },
  '& a': { color: '#1976D2', textDecoration: 'underline' },
}));

const containsHtmlBlockTags = (text: string): boolean => {
  return /<(p|ul|ol|li|h[1-6]|strong|br|hr|div|table)\b/i.test(text);
};

const QLabel = styled(Box)(() => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#1976D2',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '13px',
  fontWeight: 700,
  flexShrink: 0,
}));

const QuestionRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  width: '100%',
}));

const QuestionText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '24px',
  color: '#333333',
  wordBreak: 'break-word',
  flex: 1,
}));

const AnswerToggle = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  flexShrink: 0,
  color: '#1976D2',
  '&:hover': {
    opacity: 0.8,
  },
}));

const AnswerToggleText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: '24px',
  color: '#1976D2',
  whiteSpace: 'nowrap',
}));

const AnswerContent = styled(Box)(() => ({
  paddingTop: '12px',
  paddingLeft: '32px',
}));

/**
 * FAQタイルメッセージコンポーネント
 *
 * TOP1/TOP3の回答を表示します。
 */
export const FaqTilesMessage: React.FC<FaqTilesMessageProps> = ({
  faqs,
  // iconUrl は互換性のため props に残すが現在は未使用
  // backgroundColor は互換性のため props に残すが現在は未使用
  className = '',
  onUrlClick,
}) => {
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

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
      {faqs.map((faq, index) => {
        const isExpanded = expandedIndexes.has(index);
        return (
          <React.Fragment key={index}>
            {/* 区切り線 */}
            <Divider sx={{ my: '12px' }} />

            {/* 質問行: Q + 質問文 + 回答はこちら */}
            <QuestionRow>
              <QLabel>Q</QLabel>
              <QuestionText>{faq.question}</QuestionText>
              <AnswerToggle onClick={() => toggleExpand(index)}>
                <AnswerToggleText>回答はこちら</AnswerToggleText>
                {isExpanded ? (
                  <RemoveIcon sx={{ fontSize: '20px' }} />
                ) : (
                  <AddIcon sx={{ fontSize: '20px' }} />
                )}
              </AnswerToggle>
            </QuestionRow>

            {/* 回答（展開時のみ表示） */}
            {isExpanded && (
              <AnswerContent>
                <MessageBubble id={`faq-answer-${index}`}>
                  {containsHtmlBlockTags(faq.answer) ? (
                    <RichHtmlContent dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  ) : (
                    <MessageText>{parseMessageWithLinks(faq.answer)}</MessageText>
                  )}
                </MessageBubble>

                {/* 関連URL */}
                {faq.related_url && (
                  <MessageBubble>
                    <MessageText>
                      {parseMessageWithLinks(
                        `操作や情報などを詳しく知りたい場合は<a href="${faq.related_url}" target="_blank">こちらのページ</a>をご確認ください。`
                      )}
                    </MessageText>
                  </MessageBubble>
                )}
              </AnswerContent>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default FaqTilesMessage;
