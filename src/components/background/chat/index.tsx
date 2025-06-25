import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

interface ChatBackgroundProps {
  /** メインカラー（16進数） */
  primaryColor?: string;
  /** 幅（px） */
  width?: number;
  /** 高さ（px） */
  height?: number;
  /** 子要素 */
  children?: React.ReactNode;
  /** クラス名 */
  className?: string;
}

// 16進数カラーをRGBAに変換する関数
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// メインカラーから派生色を生成する関数
const generateDerivedColors = (primaryColor: string) => {
  const r = parseInt(primaryColor.slice(1, 3), 16);
  const g = parseInt(primaryColor.slice(3, 5), 16);
  const b = parseInt(primaryColor.slice(5, 7), 16);
  
  // より明るい色を生成（白に近づける）
  const lighterR = Math.min(255, r + (255 - r) * 0.6);
  const lighterG = Math.min(255, g + (255 - g) * 0.6);
  const lighterB = Math.min(255, b + (255 - b) * 0.6);
  
  // 全体グラデーション用の薄い色を生成
  const overlayR = Math.min(255, r + (255 - r) * 0.9);
  const overlayG = Math.min(255, g + (255 - g) * 0.9);
  const overlayB = Math.min(255, b + (255 - b) * 0.9);
  
  return {
    // 左上・右下グラデーション用の色（70%透明度）
    gradientColor: `rgba(${Math.floor(lighterR)}, ${Math.floor(lighterG)}, ${Math.floor(lighterB)}, 0.7)`,
    overlayColor: `rgba(${Math.floor(overlayR)}, ${Math.floor(overlayG)}, ${Math.floor(overlayB)}, 0.4)`,

  };
};

const StyledChatBackground = styled(Box)<{
  primaryColor: string;
  bgWidth: number;
  bgHeight: number;
}>(({ primaryColor, bgWidth, bgHeight }) => {
  const colors = generateDerivedColors(primaryColor);
  
  // Figmaの情報を基に計算された位置とサイズ
  const gradientSize = 453.11; // 453.11px
  const leftTopX = -178; // 左上のX位置
  const leftTopY = -99; // 左上のY位置
  const rightBottomX = 135.04; // 右下のX位置
  const rightBottomY = 457.89; // 右下のY位置
  
  return {
    width: bgWidth,
    height: bgHeight,
    position: 'relative',
    overflow: 'hidden',
    background: `
      linear-gradient(135deg, transparent 0%, ${colors.overlayColor} 40%),
      radial-gradient(circle at ${leftTopX + gradientSize/2}px ${leftTopY + gradientSize/2}px, #ffffff 0%, ${colors.gradientColor} 40%, transparent 70%),
      radial-gradient(circle at ${rightBottomX + gradientSize/2}px ${rightBottomY + gradientSize/2}px, #ffffff 0%, ${colors.gradientColor} 40%, transparent 70%),
      #ffffff
    `,
    backgroundSize: `
      100% 100%,
      ${gradientSize}px ${gradientSize}px,
      ${gradientSize}px ${gradientSize}px,
      100% 100%
    `,
    backgroundPosition: `
      0 0,
      ${leftTopX}px ${leftTopY}px,
      ${rightBottomX}px ${rightBottomY}px,
      0 0
    `,
    backgroundRepeat: 'no-repeat',
  };
});

/**
 * チャット背景コンポーネント
 * 
 * 複雑なグラデーション設定を持つチャットUIの背景です。
 * - 左上から中央・右80%までの放射状グラデーション（白から指定色の70%）
 * - 右下からも同様の放射状グラデーション
 * - 全体に薄いオーバーレイグラデーション（40%透明度）
 * 
 * どんな色を指定しても、自動的に適切な派生色を生成して
 * 同様の効果を適用します。
 */
export const ChatBackground: React.FC<ChatBackgroundProps> = ({
  primaryColor = '#00A79E',
  width = 375,
  height = 705,
  children,
  className = '',
}) => {
  return (
    <StyledChatBackground
      primaryColor={primaryColor}
      bgWidth={width}
      bgHeight={height}
      className={className}
    >
      {children}
    </StyledChatBackground>
  );
};

export default ChatBackground;
