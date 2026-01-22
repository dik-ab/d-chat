import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface Option {
  id: number;
  content: string;
  simple_content: string;
}

interface OptionsMessageProps {
  /** 選択肢の配列 */
  options: Option[];
  /** 質問ID */
  questionId: number;
  /** 回答ID */
  answerId: number;
  /** 選択肢がクリックされた時のハンドラー */
  onOptionClick: (content: string, optionId: number, questionId: number) => void;
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
  paddingLeft: '48px',
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  position: 'relative',
  width: '100%',
  backgroundColor: bgColor,
  borderRadius: '32px',
  padding: '16px',
  boxSizing: 'border-box',
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
  fontWeight: 700,
  lineHeight: '18px',
  color: '#FFFFFF',
  opacity: 0.8,
  marginTop: '8px',
}));

/**
 * 選択肢メッセージコンポーネント
 * 
 * 回答に選択肢がある場合に表示する独立したメッセージコンポーネントです。
 */
export const OptionsMessage: React.FC<OptionsMessageProps> = ({
  options,
  questionId,
  // answerId は将来的に使用する可能性があるため props に残すが現在は未使用
  onOptionClick,
  // iconUrl は互換性のため props に残すが使用しない
  backgroundColor = '#00A79E',
  className = '',
  disabled = false,
}) => {
  return (
    <MessageContainer className={className}>
      <MessageBubble bgColor={backgroundColor}>
        <OptionsHeader>以下の選択肢の中に該当するものはありますか？</OptionsHeader>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {options.map((option) => (
            <OptionButton
              key={option.id}
              disabled={disabled}
              onClick={() => !disabled && onOptionClick(option.content, option.id, questionId)}
            >
              <OptionText>{option.simple_content}</OptionText>
            </OptionButton>
          ))}
        </Box>
        <OptionsFooter>※該当する選択肢がない場合は手入力もできます</OptionsFooter>
      </MessageBubble>
    </MessageContainer>
  );
};

export default OptionsMessage;