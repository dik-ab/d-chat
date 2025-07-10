import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

interface ChatBackgroundProps {
  /** 背景色（16進数） */
  backgroundColor?: string;
  /** 幅（px または '100%'） */
  width?: number | string;
  /** 高さ（px または '100%'） */
  height?: number | string;
  /** 子要素 */
  children?: React.ReactNode;
  /** クラス名 */
  className?: string;
}

const StyledChatBackground = styled(Box, {
  shouldForwardProp: (prop) => !['backgroundColor', 'bgWidth', 'bgHeight'].includes(prop as string),
})<{
  backgroundColor: string;
  bgWidth: number | string;
  bgHeight: number | string;
}>(({ backgroundColor, bgWidth, bgHeight }) => {
  return {
    width: bgWidth,
    height: bgHeight,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: backgroundColor,
  };
});

/**
 * チャット背景コンポーネント
 * 
 * シンプルな単色背景のチャットUIです。
 */
export const ChatBackground: React.FC<ChatBackgroundProps> = ({
  backgroundColor = '#FFFFFF',
  width = '100%',
  height = '100%',
  children,
  className = '',
}) => {
  return (
    <StyledChatBackground
      backgroundColor={backgroundColor}
      bgWidth={width}
      bgHeight={height}
      className={className}
    >
      {children}
    </StyledChatBackground>
  );
};

export default ChatBackground;
