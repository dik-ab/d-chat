import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';

interface SurveyButtonProps {
  /** ボタンタイプ（はい/いいえ） */
  type: 'yes' | 'no';
  /** クリックハンドラー */
  onClick?: () => void;
  /** クラス名 */
  className?: string;
}

const StyledSurveyButton = styled(Button)(() => ({
  width: '224px',
  height: '51px',
  padding: '9px 36px',
  background: 'radial-gradient(ellipse at 30% 20%, rgba(199,231,231,0.15),rgba(199,231,231,0.8))',
  border: 'none',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 600,
  color: '#192A3E',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'radial-gradient(ellipse at 30% 20%, rgba(199,231,231,0.15),rgba(199,231,231,0.8)',
    boxShadow: 'none',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

/**
 * アンケートボタンコンポーネント
 * 
 * はい/いいえの選択肢を表示するボタンです。
 * 顔アイコンとテキストを横並びで表示します。
 */
export const SurveyButton: React.FC<SurveyButtonProps> = ({
  type,
  onClick,
  className = '',
}) => {
  const iconSrc = type === 'yes' ? '/yes.svg' : '/no.svg';

  return (
      <Image
        onClick={onClick}
        src={iconSrc}
        alt={`${type} face`}
        width={224}
        height={51}
      />
  );
};

export default SurveyButton;
