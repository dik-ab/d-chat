import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, TextareaAutosize, Container as MuiContainer, Typography } from '@mui/material';
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
  /** インライン表示モード（ChatContainer内で使用する場合） */
  inline?: boolean;
  /** 背景色 */
  backgroundColor?: string
}

export interface MessageInputRef {
  focus: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  textAreaRef: HTMLTextAreaElement | null;
}

// 画面下部に固定されるコンテナ
const FixedBottomContainer = styled(Box)<{ hasError?: boolean }>(({ hasError }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  zIndex: 40,
  minHeight: hasError ? '84px' : '64px',
  width: '100%',
  borderTop: '1px solid #E0E0E0',
  backgroundColor: '#FFFFFF',
  transition: 'min-height 0.2s ease-in-out',
}));

// インラインコンテナ（ChatContainer内で使用）
const InlineContainer = styled(Box)({
  width: '100%',
  minHeight: '48px',
  padding: '8px',
});

// 内部コンテナ
const InnerContainer = styled(MuiContainer)<{ hasError?: boolean }>(({ hasError }) => ({
  maxWidth: '448px', // max-w-md相当
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingTop: '8px',
  paddingBottom: hasError ? '28px' : '8px',
  transition: 'padding-bottom 0.2s ease-in-out',
}));

// フォームコンテナ
const FormContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

// 入力欄コンテナ
const InputContainer = styled(Box)({
  position: 'relative',
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
  fontSize: '16px',
  fontFamily: 'inherit',
  paddingTop: '8px',
  paddingBottom: '8px',
  lineHeight: 1.5,
  color: '#333333', // 通常の文字色を明示的に設定
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
const CharacterCount = styled(Typography)(({ isOverLimit }: { isOverLimit: boolean }) => ({
  position: 'absolute',
  right: '12px',
  bottom: '4px',
  fontSize: '12px',
  color: isOverLimit ? '#d32f2f' : '#666666',
  pointerEvents: 'none',
}));

const ErrorMessage = styled(Typography)({
  position: 'absolute',
  bottom: '-20px',
  left: '16px',
  fontSize: '12px',
  color: '#d32f2f',
  whiteSpace: 'nowrap',
});

const MAX_CHAR_LIMIT = 400;

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  placeholder = 'メッセージを入力',
  onSend,
  onMicClick,
  onChange,
  value: controlledValue,
  disabled = false,
  isMicMode = false,
  className = '',
  inline = false,
  backgroundColor
}, ref) => {
  const [internalValue, setInternalValue] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // refを通じてフォーカス機能を公開
  useImperativeHandle(ref, () => ({
    focus: () => {
      textAreaRef.current?.focus();
    },
    getValue: () => {
      return value;
    },
    setValue: (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      // TextAreaの値も更新
      if (textAreaRef.current) {
        textAreaRef.current.value = newValue;
      }
    },
    textAreaRef: textAreaRef.current
  }));

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  const handleSend = () => {
    if (value.trim() && value.length <= MAX_CHAR_LIMIT && onSend) {
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

  const Container = inline ? InlineContainer : FixedBottomContainer;

  const isOverLimit = value.length > MAX_CHAR_LIMIT;
  const shouldDisableSend = disabled || !value.trim() || isOverLimit;

  const content = (
    <form onSubmit={handleFormSubmit}>
      <FormContainer>
        <InputContainer>
          <StyledTextArea
            ref={textAreaRef}
            minRows={1}
            maxRows={10}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <CharacterCount isOverLimit={isOverLimit}>
            {value.length}/{MAX_CHAR_LIMIT}
          </CharacterCount>
          {isOverLimit && (
            <ErrorMessage>
              400文字を超えるメッセージは送信できません
            </ErrorMessage>
          )}
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
              backgroundColor={backgroundColor}
              onClick={handleSend}
              disabled={shouldDisableSend}
              size={44}
            />
          )}
        </SendButtonContainer>
      </FormContainer>
    </form>
  );

  return (
    <Container className={className} hasError={isOverLimit}>
      {inline ? content : <InnerContainer hasError={isOverLimit}>{content}</InnerContainer>}
    </Container>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
