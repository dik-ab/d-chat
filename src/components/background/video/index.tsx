import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface VideoBackgroundProps {
  /** 動画のURL */
  videoUrl: string;
  /** 吹き出しメッセージ */
  bubbleMessage: string;
}

const VideoContainer = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '100px', // ヘッダーを避けて配置
  zIndex: 5, // チャットメッセージより上に表示
}));

const Video = styled('video')(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: 0,
}));

const BubbleMessage = styled(Box)(() => ({
  backgroundColor: '#00A79E',
  borderRadius: '32px',
  padding: '24px 16px',
  width: '316px',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-30px',
    left: '50%',
    transform: 'translateX(-50%) rotate(25deg)',
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '40px solid #00A79E',
  },
}));

const BubbleText = styled(Typography)(() => ({
  color: '#FFFFFF',
  fontSize: '14px',
  fontFamily: '"Noto Sans", sans-serif',
  fontWeight: 500,
  lineHeight: 1.5,
}));

/**
 * 動画背景コンポーネント
 * 
 * チャット開始前に表示される動画背景と吹き出しメッセージ
 */
export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl,
  bubbleMessage,
}) => {
  return (
    <VideoContainer>
      <Video
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </Video>
      <BubbleMessage>
        <BubbleText>{bubbleMessage}</BubbleText>
      </BubbleMessage>
    </VideoContainer>
  );
};

export default VideoBackground;