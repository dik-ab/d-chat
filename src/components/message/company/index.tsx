import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Link } from '@mui/material';
import { RatingButtons } from '../../button/rating';

interface CompanyMessageProps {
  /** メッセージテキスト */
  message: string;
  /** 吹き出しの背景色 */
  backgroundColor?: string;
  /** アシスタントアイコンのURL */
  iconUrl?: string;
  /** クラス名 */
  className?: string;
  /** 評価ボタンの設定 */
  ratingData?: {
    matchedMessage: string;
    unmatchedMessage: string;
    conversationState: 'top1' | 'top3' | 'unmatched';
    contactPageUrl?: string | null;
    onRating: (ratingType: 'good' | 'bad' | 'none') => void;
  };
}

const MessageContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
  maxWidth: '100%',
  gap: '16px', // アイコンとメッセージの間にスペースを追加
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  position: 'relative',
  width: 'auto',
  maxWidth: '100%',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
  
  // 吹き出しの三角形（右上が頂点の二等辺三角形、左辺がチャットUIに接続）
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10px', // チャットの上から20%の位置
    left: '-5px', // チャットから飛び出す
    width: '16px',
    height: '32px',
    backgroundColor: bgColor,
    clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)', // 右上頂点の三角形
    borderRadius: '3px',
    transform: 'rotate(135deg)',
  },
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
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.8,
    },
  },
}));

// HTMLの<a>タグと<span>タグを解析してReactコンポーネントに変換する関数
const parseMessageWithLinks = (message: string): React.ReactNode => {
  // <a>タグと<span>タグを含むHTMLを解析する正規表現
  const htmlRegex = /<(a|span)\s+([^>]*?)>(.*?)<\/\1>/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = htmlRegex.exec(message)) !== null) {
    // タグの前のテキストを追加
    if (match.index > lastIndex) {
      parts.push(message.substring(lastIndex, match.index));
    }

    const tagName = match[1].toLowerCase();
    const attributes = match[2];
    const content = match[3];

    if (tagName === 'a') {
      // href属性を抽出
      const hrefMatch = attributes.match(/href\s*=\s*["']([^"']*?)["']/i);
      const href = hrefMatch ? hrefMatch[1] : '#';

      // target属性を抽出（デフォルトは_blank）
      const targetMatch = attributes.match(/target\s*=\s*["']([^"']*?)["']/i);
      const target = targetMatch ? targetMatch[1] : '_blank';

      // Linkコンポーネントを作成
      parts.push(
        <Link
          key={`link-${match.index}`}
          href={href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'underline',
              opacity: 0.8,
            },
          }}
        >
          {content}
        </Link>
      );
    } else if (tagName === 'span') {
      // style属性を抽出
      const styleMatch = attributes.match(/style\s*=\s*["']([^"']*?)["']/i);
      const styleString = styleMatch ? styleMatch[1] : '';
      
      // スタイル文字列をオブジェクトに変換
      const styleObj: React.CSSProperties = {};
      if (styleString) {
        styleString.split(';').forEach(style => {
          const [property, value] = style.split(':').map(s => s.trim());
          if (property && value) {
            // kebab-caseをcamelCaseに変換
            const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            (styleObj as Record<string, string>)[camelProperty] = value;
          }
        });
      }

      // spanコンポーネントを作成
      parts.push(
        <span key={`span-${match.index}`} style={styleObj}>
          {content}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキストを追加
  if (lastIndex < message.length) {
    parts.push(message.substring(lastIndex));
  }

  // パーツが空の場合は元のメッセージを返す
  return parts.length > 0 ? parts : message;
};

const IconImage = styled('img')(() => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
}));

/**
 * 企業メッセージコンポーネント
 * 
 * チャットで企業側が送信したメッセージを表示するコンポーネントです。
 * アイコン付きで吹き出しデザインになっています。
 * 
 * 仕様:
 * - 背景色: ChatSettingから取得
 * - アイコン: ChatSettingのURLから取得
 * - テキスト色: 白
 * - 幅: 100%（フルワイド）
 * - 高さ: コンテンツに応じて自動調整
 * - border-radius: 32px
 * - padding: 16px
 * - フォント: Noto Sans, 14px, weight 500
 * - 行間: 21px
 * - 左寄せ表示（アイコン付き）
 * - 吹き出し三角形: 左上、radius 3px
 */
export const CompanyMessage: React.FC<CompanyMessageProps> = ({
  message,
  backgroundColor = '#00A79E',
  iconUrl = '/robot.svg',
  className = '',
  ratingData,
}) => {
  return (
    <MessageContainer className={className}>
      <IconImage src={iconUrl} alt="Assistant" />
      <MessageBubble bgColor={backgroundColor}>
        {/* 通常のメッセージまたは評価メッセージ */}
        {ratingData ? (
          <RatingButtons
            matchedMessage={ratingData.matchedMessage}
            unmatchedMessage={ratingData.unmatchedMessage}
            conversationState={ratingData.conversationState}
            contactPageUrl={ratingData.contactPageUrl}
            onRating={ratingData.onRating}
          />
        ) : (
          <MessageText>
            {parseMessageWithLinks(message)}
          </MessageText>
        )}
      </MessageBubble>
    </MessageContainer>
  );
};

export default CompanyMessage;
