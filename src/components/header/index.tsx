import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface HeaderProps {
  /** ヘッダータイトル */
  title?: string;
  /** 閉じるボタンのクリックハンドラー */
  onClose?: () => void;
  /** クラス名 */
  className?: string;
}

const HeaderContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#FFFFFF',
  padding: '13px 16px',
  boxSizing: 'border-box',
  width: '100%',
}));

const HeaderTitle = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '21px',
  color: '#000000',
  flex: 1,
}));

const CloseButton = styled(IconButton)(() => ({
  padding: 0,
  minWidth: 'auto',
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
    color: '#000000',
  },
}));

/**
 * ヘッダーコンポーネント
 * 
 * アプリケーションのヘッダーを表示するコンポーネントです。
 * タイトルと右側に閉じるボタン（×マーク）を配置しています。
 * 
 * 仕様:
 * - 背景色: 白 (#FFFFFF)
 * - padding: 上下13px、左右16px
 * - フォント: Noto Sans, 16px, weight 600
 * - 行間: 21px
 * - 右側に×ボタン配置
 */
export const Header: React.FC<HeaderProps> = ({
  title = '',
  onClose,
  className = '',
}) => {
  return (
    <HeaderContainer className={className}>
      <HeaderTitle>
        {title}
      </HeaderTitle>
      <CloseButton onClick={onClose} aria-label="閉じる">
        <CloseIcon />
      </CloseButton>
    </HeaderContainer>
  );
};

export default Header;
