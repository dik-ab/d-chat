import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import { RobotIcon } from '../../icon/robot';

interface CompanyMessageProps {
  /** メッセージテキスト */
  message: string;
  /** メインカラー（16進数）- このカラーから背景色とアイコン背景色を動的に生成 */
  color?: string;
  /** クラス名 */
  className?: string;
}

const MessageContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
  maxWidth: '100%',
  paddingLeft: '50px', // アイコン分のスペースを確保
  '& > :first-of-type': {
    position: 'absolute',
    top: '0px', // アイコンを上から0pxの位置に固定
    left: '0px', // アイコンを左端に固定
    zIndex: 1,
  },
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  position: 'relative',
  width: '228px',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
  
  // 吹き出しの三角形（右上が頂点の二等辺三角形、左辺がチャットUIに接続）
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10px', // チャットの上から20%の位置
    left: '-5px', // チャットから飛び出す
    width: '16px',
    height: '32px',
    backgroundColor: bgColor,
    clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)', // 右上頂点の三角形
    borderRadius: '3px',
    transform: 'rotate(135deg)',
  },
}));

const MessageText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#FFFFFF',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
}));

/**
 * 企業メッセージコンポーネント
 * 
 * チャットで企業側が送信したメッセージを表示するコンポーネントです。
 * アイコン付きで吹き出しデザインになっています。
 * 
 * 仕様:
 * - メインカラーから背景色とアイコン背景色を動的に生成
 * - チャット背景: mix(白, メイン, 0.75)
 * - アイコン背景: 彩度 +5%, 明度 +20%（薄く調整）
 * - テキスト色: 白
 * - 幅: 228px
 * - 高さ: コンテンツに応じて自動調整
 * - border-radius: 32px
 * - padding: 16px
 * - フォント: Noto Sans, 14px, weight 500
 * - 行間: 21px
 * - 左寄せ表示（アイコン付き）
 * - 吹き出し三角形: 左上、radius 3px
 */
export const CompanyMessage: React.FC<CompanyMessageProps> = ({
  message,
  color = '#00A79E',
  className = '',
}) => {
  
  // メインカラーからアイコン背景色を生成（彩度+5%, 明度+20%でより薄く）
  const iconBackgroundColor = chroma(color)
    .saturate(0.9)  // 彩度を5%上げる（薄く）
    .brighten(0.9)   // 明度を20%上げる（より明るく）
    .hex();

  return (
    <MessageContainer className={className}>
      <RobotIcon 
        size={32} 
        backgroundColor={iconBackgroundColor}
      />
      <MessageBubble bgColor={color}>
        <MessageText>
          {message}
        </MessageText>
      </MessageBubble>
    </MessageContainer>
  );
};

export default CompanyMessage;
