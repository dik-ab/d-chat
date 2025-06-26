import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeProvider } from '@mui/material/styles';
import { SendButton } from './index';
import { theme } from '../../../theme/theme';

const meta: Meta<typeof SendButton> = {
  title: 'BUTTON/send',
  component: SendButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '送信ボタンコンポーネント。背景色が可変で、SendIconを白色で表示する円形のボタンです。ホバー時にスケールアニメーションが適用されます。',
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
    backgroundColor: {
      control: { type: 'color' },
      description: '背景色',
    },
    size: {
      control: { type: 'range', min: 24, max: 80, step: 4 },
      description: 'サイズ（px）',
    },
    onClick: {
      action: 'clicked',
      description: 'クリックハンドラー',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '無効状態',
    },
    className: {
      control: { type: 'text' },
      description: 'クラス名',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// デフォルトストーリー
export const Default: Story = {
  args: {
    size: 48,
    backgroundColor: '#00A79E',
  },
};

// 小さいサイズ
export const Small: Story = {
  args: {
    size: 32,
    backgroundColor: '#00A79E',
  },
};

// 大きいサイズ
export const Large: Story = {
  args: {
    size: 64,
    backgroundColor: '#00A79E',
  },
};

// 無効状態
export const Disabled: Story = {
  args: {
    size: 48,
    backgroundColor: '#00A79E',
    disabled: true,
  },
};

// 異なる背景色のバリエーション
export const BlueVariant: Story = {
  args: {
    size: 48,
    backgroundColor: '#2196F3',
  },
};

export const RedVariant: Story = {
  args: {
    size: 48,
    backgroundColor: '#F44336',
  },
};

export const PurpleVariant: Story = {
  args: {
    size: 48,
    backgroundColor: '#9C27B0',
  },
};

export const OrangeVariant: Story = {
  args: {
    size: 48,
    backgroundColor: '#FF9800',
  },
};

// サイズ比較
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <SendButton size={24} backgroundColor="#00A79E" />
      <SendButton size={32} backgroundColor="#00A79E" />
      <SendButton size={48} backgroundColor="#00A79E" />
      <SendButton size={64} backgroundColor="#00A79E" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '異なるサイズのSendButtonの比較',
      },
    },
  },
};

// カラーバリエーション
export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      <SendButton size={48} backgroundColor="#00A79E" />
      <SendButton size={48} backgroundColor="#2196F3" />
      <SendButton size={48} backgroundColor="#F44336" />
      <SendButton size={48} backgroundColor="#4CAF50" />
      <SendButton size={48} backgroundColor="#FF9800" />
      <SendButton size={48} backgroundColor="#9C27B0" />
      <SendButton size={48} backgroundColor="#607D8B" />
      <SendButton size={48} backgroundColor="#795548" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '様々な背景色のSendButton',
      },
    },
  },
};

// 状態の比較
export const StateComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <SendButton size={48} backgroundColor="#00A79E" />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>通常</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SendButton size={48} backgroundColor="#00A79E" disabled />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>無効</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '通常状態と無効状態の比較',
      },
    },
  },
};
