import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, TextareaAutosize, Container as MuiContainer } from '@mui/material';
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

// 画面下部に固定されるコンテナ
const FixedBottomContainer = styled(Box)({
  position: 'fixed',
  bottom: 0,
  left: 0,
  zIndex: 40,
  minHeight: '64px',
  width: '100%',
  borderTop: '1px solid #E0E0E0',
  backgroundColor: '#FFFFFF',
});

// 内部コンテナ
const InnerContainer = styled(MuiContainer)({
  maxWidth: '448px', // max-w-md相当
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingTop: '8px',
  paddingBottom: '8px',
});

// フォームコンテナ
const FormContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

// 入力欄コンテナ
const InputContainer = styled(Box)({
  flex: 1,
  borderRadius: '24px',
  backgroundColor: '#F5F5F5',
  paddingTop: '4px',
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingBottom: '4px',
  display: 'flex',
  alignItems: 'center',
  minHeight: '44px',
  '&:focus-within': {
    outline: '2px solid #1976D2',
  },
});

const StyledTextArea = styled(TextareaAutosize)({
  width: '100%',
  resize: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  fontFamily: 'inherit',
  paddingTop: '8px',
  paddingBottom: '8px',
  lineHeight: 1.5,
  '&::placeholder': {
    color: '#8E8E8E',
    opacity: 1,
    textAlign: 'left',
  },
  '&:disabled': {
    color: '#CCCCCC',
  },
});

const SendButtonContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

const MicButton = styled(IconButton)({
  width: '44px',
  height: '44px',
  backgroundColor: '#F2F4F5',
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: '#E8EAEB',
  },
});

/**
 * メッセージ入力コンポーネント
 * 
 * 画面下部に固定され、上に向かって伸びるメッセージ入力フォームです。
 * 入力欄は自動的に高さが調整され、複数行の入力に対応します。
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  placeholder = 'メッセージを入力',
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
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    onMicClick?.();
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!disabled) {
      handleSend();
    }
  };

  return (
    <FixedBottomContainer className={className}>
      <InnerContainer>
        <form onSubmit={handleFormSubmit}>
          <FormContainer>
            <InputContainer>
              <StyledTextArea
                minRows={1}
                maxRows={10}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
            </InputContainer>
            <SendButtonContainer>
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
                  size={44}
                />
              )}
            </SendButtonContainer>
          </FormContainer>
        </form>
      </InnerContainer>
    </FixedBottomContainer>
  );
};

export default MessageInput;
