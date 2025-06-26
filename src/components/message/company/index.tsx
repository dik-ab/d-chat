import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { RobotIcon } from '../../icon/robot';

interface CompanyMessageProps {
  /** メッセージテキスト */
  message: string;
  /** 背景色（16進数） */
  backgroundColor?: string;
  /** アイコンの背景色（16進数） */
  iconBackgroundColor?: string;
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
  '& > :first-child': {
    position: 'absolute',
    top: '0px', // アイコンを上から0pxの位置に固定
    left: '0px', // アイコンを左端に固定
    zIndex: 1,
  },
}));

const MessageBubble = styled(Box)<{ bgColor: string }>(({ bgColor }) => ({
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
  color: '#000000',
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
 * - 背景色: 指定可能（デフォルト: #F0F0F0）
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
  backgroundColor = '#F0F0F0',
  iconBackgroundColor = '#C3E5E3',
  className = '',
}) => {
  return (
    <MessageContainer className={className}>
      <RobotIcon 
        size={32} 
        backgroundColor={iconBackgroundColor}
      />
      <MessageBubble bgColor={backgroundColor}>
        <MessageText>
          {message}
        </MessageText>
      </MessageBubble>
    </MessageContainer>
  );
};

export default CompanyMessage;
