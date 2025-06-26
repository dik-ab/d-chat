
import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeProvider } from '@mui/material/styles';
import { MessageInput } from './index';
import { theme } from '../../../theme/theme';

const meta: Meta<typeof MessageInput> = {
  title: 'INPUT/MessageInput',
  component: MessageInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'メッセージ入力フォームコンポーネント。テキスト入力欄と送信ボタン、マイクボタンを含みます。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '無効状態',
    },
    value: {
      control: { type: 'text' },
      description: '入力値（制御コンポーネント用）',
    },
    isMicMode: {
      control: { type: 'boolean' },
      description: 'マイクモードかどうか',
    },
    onSend: {
      action: 'onSend',
      description: '送信ボタンクリック時のハンドラー',
    },
    onMicClick: {
      action: 'onMicClick',
      description: 'マイクボタンクリック時のハンドラー',
    },
    onChange: {
      action: 'onChange',
      description: '入力値の変更ハンドラー',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '質問を入力してください...',
  },
  parameters: {
    docs: {
      description: {
        story: 'デフォルトのメッセージ入力フォーム',
      },
    },
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'メッセージを入力...',
  },
  parameters: {
    docs: {
      description: {
        story: 'カスタムプレースホルダーを設定した例',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '質問を入力してください...',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: '無効状態のメッセージ入力フォーム',
      },
    },
  },
};

export const WithInitialValue: Story = {
  args: {
    placeholder: '質問を入力してください...',
    value: 'こんにちは！\nこれは複数行のテキストです。',
  },
  parameters: {
    docs: {
      description: {
        story: '初期値が設定された例（複数行テキスト）',
      },
    },
  },
};

export const MicMode: Story = {
  args: {
    placeholder: '質問を入力してください...',
    isMicMode: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'マイクモードのメッセージ入力フォーム（送信ボタンの代わりにマイクボタンが表示）',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    placeholder: '質問を入力してください...',
  },
  parameters: {
    docs: {
      description: {
        story: 'インタラクティブな例。テキストを入力してEnterキーまたは送信ボタンで送信できます。',
      },
    },
  },
  render: (args) => {
    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <MessageInput
          {...args}
          onSend={(message) => {
            alert(`送信されたメッセージ: ${message}`);
          }}
          onMicClick={() => {
            alert('マイクボタンがクリックされました');
          }}
        />
      </div>
    );
  },
};

export const ModeComparison: Story = {
  parameters: {
    docs: {
      description: {
        story: '送信モードとマイクモードの比較',
      },
    },
  },
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '400px', padding: '20px' }}>
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>送信モード（デフォルト）</h4>
          <MessageInput
            placeholder="質問を入力してください..."
            value="サンプルテキスト"
          />
        </div>
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>マイクモード</h4>
          <MessageInput
            placeholder="質問を入力してください..."
            value="サンプルテキスト"
            isMicMode={true}
          />
        </div>
      </div>
    );
  },
};
