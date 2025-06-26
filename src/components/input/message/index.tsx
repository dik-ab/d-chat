import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TextField, IconButton, TextareaAutosize } from '@mui/material';
import { SendButton } from '../../button/send';
import { MicIcon } from '../../icon/mic';

interface MessageInputProps {
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 送信ボタンクリック時のハンドラー */
  onSend?: (message: string) => void;
  /** マイクボタンクリック時のハンドラー */
  onMicClick?: () => void;
  /** 入力値の変更ハンドラー */
  onChange?: (value: string) => void;
  /** 初期値 */
  value?: string;
  /** 無効状態 */
  disabled?: boolean;
  /** マイクモードかどうか */
  isMicMode?: boolean;
  /** クラス名 */
  className?: string;
}

const Container = styled(Box)({
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: '4px',
  display: 'flex',
  alignItems: 'flex-end',
  gap: '4px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

const InputContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '375px',
});

const StyledTextArea = styled(TextareaAutosize)({
  width: '100%',
  backgroundColor: '#F2F4F5',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  padding: '12px',
  resize: 'none',
  outline: 'none',
  lineHeight: 1.5,
  minHeight: '20px',
  '&::placeholder': {
    color: '#8E8E8E',
    opacity: 1,
  },
  '&:focus': {
    backgroundColor: '#F2F4F5',
    outline: 'none',
  },
  '&:disabled': {
    backgroundColor: '#E8EAEB',
    color: '#CCCCCC',
  },
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
});

const MicButton = styled(IconButton)({
  width: '48px',
  height: '48px',
  backgroundColor: '#F2F4F5',
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: '#E8EAEB',
  },
});

/**
 * メッセージ入力コンポーネント
 * 
 * テキスト入力欄と送信ボタン、マイクボタンを含むメッセージ入力フォームです。
 * 入力欄は自動的に高さが調整され、複数行の入力に対応します。
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  placeholder = '質問を入力してください...',
  onSend,
  onMicClick,
  onChange,
  value: controlledValue,
  disabled = false,
  isMicMode = false,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState('');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  const handleSend = () => {
    if (value.trim() && onSend) {
      onSend(value.trim());
      if (controlledValue === undefined) {
        setInternalValue('');
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    onMicClick?.();
  };

  return (
    <Container className={className}>
      <InputContainer>
        <StyledTextArea
          minRows={1}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </InputContainer>
      
      <ButtonContainer>
        {isMicMode ? (
          <MicButton
            onClick={handleMicClick}
            disabled={disabled}
            aria-label="音声入力"
          >
            <MicIcon size={24} />
          </MicButton>
        ) : (
          <SendButton
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            size={36}
          />
        )}
      </ButtonContainer>
    </Container>
  );
};

export default MessageInput;
