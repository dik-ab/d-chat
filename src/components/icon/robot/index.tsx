import React from 'react';
import { Avatar, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface RobotIconProps {
  /** アイコンのサイズ（px） */
  size?: number;
  /** 背景色（グラデーションの開始色） */
  backgroundColor?: string;
  /** クラス名 */
  className?: string;
}

/**
 * 指定した色から自動的にグラデーションを生成する関数
 * 元の色から約20%暗い色を生成
 */
const generateGradientEndColor = (startColor: string): string => {
  // #を除去
  const hex = startColor.replace('#', '');
  
  // RGBに変換
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 約20%暗くする（0.8を掛ける）
  const newR = Math.round(r * 0.8);
  const newG = Math.round(g * 0.8);
  const newB = Math.round(b * 0.8);
  
  // 16進数に戻す
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

const StyledAvatar = styled(Avatar)<{ size: number; startColor: string; endColor: string }>(
  ({ size, startColor, endColor }) => ({
    width: size,
    height: size,
    background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: size * 0.05, // 最小限の余白
  })
);

const RobotImage = styled('img')<{ iconSize: number }>(({ iconSize }) => ({
  width: iconSize,
  height: iconSize,
  objectFit: 'contain',
}));

/**
 * ロボットアイコンコンポーネント
 * 
 * 丸い背景にグラデーションを適用し、中央にロボットのSVGアイコンを表示します。
 * 背景色を指定すると、自動的に適切なグラデーションが生成されます。
 */
export const RobotIcon: React.FC<RobotIconProps> = ({
  size = 32,
  backgroundColor = '#C3E5E3',
  className = '',
}) => {
  const endColor = generateGradientEndColor(backgroundColor);
  const iconSize = size * 0.9; // アイコンサイズを背景の80%に設定

  return (
    <StyledAvatar
      size={size}
      startColor={backgroundColor}
      endColor={endColor}
      className={className}
    >
      <RobotImage
        src="/robot.svg"
        alt="Robot Icon"
        iconSize={iconSize}
      />
    </StyledAvatar>
  );
};

export default RobotIcon;
