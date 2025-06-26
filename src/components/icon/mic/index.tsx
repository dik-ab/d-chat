import React from 'react';
import { styled } from '@mui/material/styles';

interface MicIconProps {
  /** アイコンのサイズ（px） */
  size?: number;
  /** クラス名 */
  className?: string;
}

const MicImage = styled('img')<{ size: number }>(({ size }) => ({
  width: size,
  height: size,
  objectFit: 'contain',
}));

/**
 * マイクアイコンコンポーネント
 * 
 * マイクのSVGアイコンを表示します。
 */
export const MicIcon: React.FC<MicIconProps> = ({
  size = 32,
  className = '',
}) => {
  return (
    <MicImage
      src="/mic_icon.svg"
      alt="Mic Icon"
      size={size}
      className={className}
    />
  );
};

export default MicIcon;
