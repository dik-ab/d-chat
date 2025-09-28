import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface Option {
  content: string;
  simple_content: string;
}

interface OptionsMessageProps {
  /** 選択肢の配列 */
  options: Option[];
  /** 選択肢がクリックされた時のハンドラー */
  onOptionClick: (content: string) => void;
  /** アシスタントアイコンのURL */
  iconUrl?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** クラス名 */
  className?: string;
  /** 無効状態 */
  disabled?: boolean;
}

const MessageContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '8px',
  maxWidth: '100%',
  gap: '16px',
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  position: 'relative',
  width: 'auto',
  maxWidth: '100%',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
  
  // 吹き出しの三角形
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10px',
    left: '-5px',
    width: '16px',
    height: '32px',
    backgroundColor: bgColor,
    clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)',
    borderRadius: '3px',
    transform: 'rotate(135deg)',
  },
}));

const OptionsHeader = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  color: '#FFFFFF',
  marginBottom: '8px',
}));

const OptionButton = styled('div', {
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ disabled }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  padding: '8px 16px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  opacity: disabled ? 0.6 : 1,
  '&:hover': disabled ? {} : {
    backgroundColor: '#F5F5F5',
    transform: 'scale(1.02)',
  },
  '&:active': disabled ? {} : {
    transform: 'scale(0.98)',
  },
}));

const OptionText = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '19px',
  color: '#000000',
}));

const OptionsFooter = styled(Typography)(() => ({
  fontFamily: '"Noto Sans", sans-serif',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '18px',
  color: '#FFFFFF',
  opacity: 0.8,
  marginTop: '8px',
}));

const IconImage = styled('img')(() => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
}));

/**
 * 選択肢メッセージコンポーネント
 * 
 * 回答に選択肢がある場合に表示する独立したメッセージコンポーネントです。
 */
export const OptionsMessage: React.FC<OptionsMessageProps> = ({
  options,
  onOptionClick,
  iconUrl = '/robot.svg',
  backgroundColor = '#00A79E',
  className = '',
  disabled = false,
}) => {
  return (
    <MessageContainer className={className}>
      <IconImage src={iconUrl} alt="Assistant" />
      <MessageBubble bgColor={backgroundColor}>
        <OptionsHeader>この中に選択肢はありますか？</OptionsHeader>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {options.map((option, index) => (
            <OptionButton
              key={index}
              disabled={disabled}
              onClick={() => !disabled && onOptionClick(option.content)}
            >
              <OptionText>{option.simple_content}</OptionText>
            </OptionButton>
          ))}
        </Box>
        <OptionsFooter>※選択肢にない場合は手入力もできます</OptionsFooter>
      </MessageBubble>
    </MessageContainer>
  );
};

export default OptionsMessage;