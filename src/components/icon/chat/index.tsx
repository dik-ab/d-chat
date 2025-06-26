import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { RobotIcon } from '../robot';

interface ChatIconProps {
  /** クローズボタンのクリックハンドラー */
  onClose?: () => void;
  /** クラス名 */
  className?: string;
}

const ChatContainer = styled(Box)(({ theme }) => ({
  width: 136,
  height: 136,
  borderRadius: 24,
  backgroundColor: theme.palette.brand.primary,
  padding: '14px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: 33,
  height: 33,
  borderRadius: '50%',
  backgroundColor: theme.palette.brand.secondary,
  color: 'white',
  transform: 'translate(30%, -30%)',
  '&:hover': {
    backgroundColor: theme.palette.brand.secondary,
    opacity: 0.8,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 16,
  },
}));

const ChatText = styled(Typography)({
  color: 'white',
  fontSize: 15,
  fontWeight: 600,
  textAlign: 'center',
  marginTop: 8,
  lineHeight: '21px',
});

/**
 * チャットアイコンコンポーネント
 * 
 * ロボットアイコンと「チャットで質問する」テキスト、クローズボタンを含む
 * 136px * 136px のサイズで、角丸24pxの背景を持ちます。
 */
export const ChatIcon: React.FC<ChatIconProps> = ({
  onClose,
  className = '',
}) => {

  return (
    <ChatContainer className={className}>
      <CloseButton onClick={onClose} size="small">
        <CloseIcon />
      </CloseButton>
      
      <RobotIcon 
        size={48} 
        backgroundColor="rgba(255, 255, 255, 0.2)"
      />
      
      <ChatText>
        チャットで<br />質問する
      </ChatText>
    </ChatContainer>
  );
};

export default ChatIcon;
