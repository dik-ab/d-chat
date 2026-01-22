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
        justifyContent: 'flex-start',
        alignItems: 'center',
        my: 2,
        width: '100%',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: isNewSessionMessage ? 400 : 600,
          color: isNewSessionMessage ? '#999999' : '#666666',
          fontSize: '14px',
          textAlign: 'left',
          whiteSpace: 'pre-line',
          width: '100%',
        }}
      >
        {message.content}
      </Typography>
    </Box>
  );
};