import React from 'react';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

interface SendButtonProps {
  /** 背景色 */
  backgroundColor?: string;
  /** サイズ（px） */
  size?: number;
  /** クリックハンドラー */
  onClick?: () => void;
  /** 無効状態 */
  disabled?: boolean;
  /** クラス名 */
  className?: string;
}

const StyledSendButton = styled(IconButton, {
  shouldForwardProp: (prop) => !['backgroundColor', 'buttonSize'].includes(prop as string),
})<{ 
  backgroundColor: string; 
  buttonSize: number; 
}>(({ backgroundColor, buttonSize }) => ({
  width: buttonSize,
  height: buttonSize,
  backgroundColor: backgroundColor,
  color: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: backgroundColor,
    opacity: 0.9,
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
    opacity: 0.6,
    transform: 'none',
  },
  '& .MuiSvgIcon-root': {
    fontSize: buttonSize * 0.5,
  },
}));

/**
 * 送信ボタンコンポーネント
 * 
 * 背景色が可変で、SendIconを白色で表示する角丸12pxの四角ボタンです。
 * ホバー時にスケールアニメーションが適用されます。
 */
export const SendButton: React.FC<SendButtonProps> = ({
  backgroundColor = '#00A79E',
  size = 48,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <StyledSendButton
      backgroundColor={backgroundColor}
      buttonSize={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label="送信"
    >
      <SendIcon />
    </StyledSendButton>
  );
};

export default SendButton;
