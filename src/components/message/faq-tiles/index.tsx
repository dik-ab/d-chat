'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  /** アシスタントアイコンのURL（互換性のため残すが使用しない） */
  iconUrl?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** クラス名 */
  className?: string;
  /** URLクリックハンドラー */
  onUrlClick?: (url: string) => void;
}

const QuestionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  width: '100%',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '8px',
  '&:hover': {
    opacity: 0.9,
  },
}));

const QuestionText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const AccordionContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded' && prop !== 'contentHeight',
})<{ isExpanded: boolean; contentHeight: number }>(({ isExpanded, contentHeight }) => ({
  maxHeight: isExpanded ? `${contentHeight}px` : '0',
  overflow: 'hidden',
  transition: 'max-height 0.5s ease-in-out',
  marginBottom: isExpanded ? '8px' : '0',
}));

const AnswerBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  width: '100%',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
  marginBottom: '8px',
}));

const AnswerText = styled(Typography)(() => ({
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

const ExpandIcon = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded: boolean }>(({ isExpanded }) => ({
  display: 'inline-block',
  transition: 'transform 0.3s ease',
  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
}));

/**
 * FAQタイルメッセージコンポーネント
 *
 * TOP1/TOP3の回答をタイル形式で表示し、クリックで詳細を展開します。
 * ユーザーメッセージと同じ楕円形スタイルで、アイコンなしで表示されます。
 */
export const FaqTilesMessage: React.FC<FaqTilesMessageProps> = ({
  faqs,
  // iconUrl は互換性のため props に残すが使用しない
  backgroundColor = '#00A79E',
  className = '',
  onUrlClick,
}) => {
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());
  const [contentHeights, setContentHeights] = useState<{ [key: number]: number }>({});
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // コンテンツの高さを測定
  useEffect(() => {
    const newHeights: { [key: number]: number } = {};
    Object.keys(contentRefs.current).forEach((key) => {
      const index = parseInt(key);
      const element = contentRefs.current[index];
      if (element) {
        newHeights[index] = element.scrollHeight;
      }
    });
    setContentHeights(newHeights);
  }, [faqs]);

  const handleUrlClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (onUrlClick) {
      onUrlClick(url);
    }
    // e.preventDefault()を削除してデフォルトのリンク動作を許可
  };

  const parseMessageWithLinks = (text: string) => {
    const regex = /<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // テキスト部分を追加
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // リンク部分を追加
      const url = match[1];
      const linkText = match[2];
      parts.push(
        <a
          key={match.index}
          href={url}
          onClick={(e) => handleUrlClick(e, url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // 残りのテキストを追加
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingLeft: '48px' }}>
      {faqs.map((faq, index) => {
        const isExpanded = expandedIndexes.has(index);

        return (
          <Box key={index} sx={{ width: '100%' }}>
            {/* 質問ボタン */}
            <QuestionButton
              bgColor={backgroundColor}
              onClick={() => toggleExpand(index)}
            >
              <QuestionText>
                <ExpandIcon isExpanded={isExpanded}>▶</ExpandIcon>
                {faq.question}
              </QuestionText>
            </QuestionButton>

            {/* アコーディオンコンテンツ */}
            <AccordionContent
              isExpanded={isExpanded}
              contentHeight={contentHeights[index] || 0}
            >
              <Box
                ref={(el: HTMLDivElement | null) => {
                  contentRefs.current[index] = el;
                }}
                sx={{ paddingLeft: '24px' }}
              >
                {/* 回答 */}
                <AnswerBubble bgColor={backgroundColor}>
                  <AnswerText>{parseMessageWithLinks(faq.answer)}</AnswerText>
                </AnswerBubble>

                {/* 関連URL */}
                {faq.related_url && (
                  <AnswerBubble bgColor={backgroundColor}>
                    <AnswerText>
                      {parseMessageWithLinks(
                        `操作や情報などを詳しく知りたい場合は<a href="${faq.related_url}" target="_blank">こちらのページ</a>をご確認ください。`
                      )}
                    </AnswerText>
                  </AnswerBubble>
                )}
              </Box>
            </AccordionContent>
          </Box>
        );
      })}
    </Box>
  );
};

export default FaqTilesMessage;
