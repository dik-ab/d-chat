import React from 'react';
import { Box, Typography } from '@mui/material';
import { Message } from '@/types/chat';

interface SeparatorMessageProps {
  message: Message;
}

export const SeparatorMessage: React.FC<SeparatorMessageProps> = ({ message }) => {
  // 新しいセッション開始のメッセージの場合は薄い文字で表示
  const isNewSessionMessage = message.content.includes('ここから新しいチャット');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        my: 3,
        width: '100%',
        borderTop: isNewSessionMessage ? '1px solid #E0E0E0' : 'none',
        pt: isNewSessionMessage ? 2 : 0,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: isNewSessionMessage ? 400 : 600,
          color: isNewSessionMessage ? '#999999' : '#666666',
          fontSize: '14px',
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {message.content}
      </Typography>
    </Box>
  );
};