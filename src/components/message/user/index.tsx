import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface UserMessageProps {
  /** メッセージテキスト */
  message: string;
  /** 背景色 */
  backgroundColor?: string;
  /** クラス名 */
  className?: string;
}

const StyledUserMessage = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{ backgroundColor: string }>(({ backgroundColor }) => ({
  width: '228px',
  backgroundColor: backgroundColor,
  borderRadius: '32px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto', // 右寄せ
  marginBottom: '8px',
  boxSizing: 'border-box',
}));

const MessageText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#000000',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
}));

/**
 * ユーザーメッセージコンポーネント
 * 
 * チャットでユーザーが送信したメッセージを表示するコンポーネントです。
 * 
 * 仕様:
 * - 背景色: #D2E5DE
 * - 幅: 228px
 * - 高さ: コンテンツに応じて自動調整
 * - border-radius: 32px
 * - padding: 16px
 * - フォント: Noto Sans, 14px, weight 500
 * - 行間: 21px
 * - 右寄せ表示
 */
export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  backgroundColor = '#D2E5DE',
  className = '',
}) => {
  return (
    <StyledUserMessage backgroundColor={backgroundColor} className={className}>
      <MessageText>
        {message}
      </MessageText>
    </StyledUserMessage>
  );
};

export default UserMessage;
