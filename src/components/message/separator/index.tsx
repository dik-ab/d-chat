import React from 'react';
import { Box, Typography } from '@mui/material';
import { Message } from '@/types/chat';

interface SeparatorMessageProps {
  message: Message;
}

export const SeparatorMessage: React.FC<SeparatorMessageProps> = ({ message }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        my: 2,
        px: 2,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#666666',
          fontSize: '14px',
        }}
      >
        {message.content}
      </Typography>
    </Box>
  );
};