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
  /** アイコンを非表示にするか */
  hideIcon?: boolean;
  /** 評価ボタンの設定 */
  ratingData?: {
    matchedMessage: string;
    unmatchedMessage: string;
    conversationState: 'top1' | 'top3' | 'unmatched';
    contactPageUrl?: string | null;
    onRating: (ratingType: 'good' | 'bad' | 'none') => void;
  };
  /** URLクリック時のトラッキング関数 */
  onUrlClick?: (url: string) => void;
}

const MessageContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginBottom: '8px',
  maxWidth: '100%',
  gap: '8px', // アイコンとメッセージの間にスペース
}));

const MessageBubble = styled(Box)(() => ({
  position: 'relative',
  width: 'auto',
  maxWidth: '100%',
  boxSizing: 'border-box',
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
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.8,
    },
  },
}));

// リッチHTMLコンテンツ用のスタイル付きコンテナ
const RichHtmlContent = styled(Box)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#333333',
  wordBreak: 'break-word',
  '& p': {
    margin: '0 0 8px 0',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  '& h3': {
    fontSize: '14px',
    fontWeight: 700,
    margin: '12px 0 8px 0',
  },
  '& ul': {
    margin: '4px 0 8px 0',
    paddingLeft: '20px',
    listStyleType: 'disc',
  },
  '& ol': {
    margin: '4px 0 8px 0',
    paddingLeft: '20px',
    listStyleType: 'decimal',
  },
  '& li': {
    marginBottom: '4px',
    '& ol': {
      marginTop: '4px',
    },
  },
  '& strong': {
    fontWeight: 700,
  },
  '& hr': {
    border: 'none',
    borderTop: '1px solid #E0E0E0',
    margin: '12px 0',
  },
  '& br': {
    lineHeight: '21px',
  },
  '& a': {
    color: '#1976D2',
    textDecoration: 'underline',
    '&:hover': {
      opacity: 0.8,
    },
  },
}));

// メッセージにHTMLブロック要素が含まれているかチェック
const containsHtmlBlockTags = (message: string): boolean => {
  return /<(p|ul|ol|li|h[1-6]|strong|br|hr|div|table)\b/i.test(message);
};

// HTMLの<a>タグと<span>タグを解析してReactコンポーネントに変換する関数
const parseMessageWithLinks = (message: string, onUrlClick?: (url: string) => void): React.ReactNode => {
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
          onClick={() => {
            if (onUrlClick) {
              onUrlClick(href);
            }
          }}
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
 * 左上にアイコン、その下にテキストを表示するシンプルなレイアウトです。
 *
 * 仕様:
 * - アイコン: ChatSettingのURLから取得
 * - テキスト色: #333333
 * - フォント: Noto Sans, 14px, weight 500
 * - 行間: 21px
 * - 左寄せ表示（アイコンが上、テキストが下の縦並び）
 */
export const CompanyMessage: React.FC<CompanyMessageProps> = ({
  message,
  // backgroundColor は互換性のため props に残すが現在は未使用
  iconUrl = '/robot.svg',
  className = '',
  hideIcon = false,
  ratingData,
  onUrlClick,
}) => {
  return (
    <MessageContainer className={className}>
      {!hideIcon && <IconImage src={iconUrl} alt="Assistant" />}
      <MessageBubble>
        {/* 通常のメッセージまたは評価メッセージ */}
        {ratingData ? (
          <RatingButtons
            matchedMessage={ratingData.matchedMessage}
            unmatchedMessage={ratingData.unmatchedMessage}
            conversationState={ratingData.conversationState}
            contactPageUrl={ratingData.contactPageUrl}
            onRating={ratingData.onRating}
            onUrlClick={onUrlClick}
          />
        ) : containsHtmlBlockTags(message) ? (
          <RichHtmlContent dangerouslySetInnerHTML={{ __html: message }} />
        ) : (
          <MessageText>
            {parseMessageWithLinks(message, onUrlClick)}
          </MessageText>
        )}
      </MessageBubble>
    </MessageContainer>
  );
};

export default CompanyMessage;
