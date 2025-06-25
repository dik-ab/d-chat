import type { Meta, StoryObj } from '@storybook/nextjs';
import { ThemeProvider } from '@mui/material/styles';
import { ChatIcon } from './index';
import { theme } from '../../../theme/theme';

const meta: Meta<typeof ChatIcon> = {
  title: 'Icon/ChatIcon',
  component: ChatIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'チャットアイコンコンポーネント。ロボットアイコンと「チャットで質問する」テキスト、クローズボタンを含む136px * 136pxのサイズで、角丸24pxの背景を持ちます。',
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
    onClose: {
      action: 'closed',
      description: 'クローズボタンのクリックハンドラー',
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
  args: {},
};

// クローズボタンありのストーリー
export const WithCloseHandler: Story = {
  args: {
    onClose: () => console.log('Chat closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'クローズボタンにハンドラーが設定されたバージョン',
      },
    },
  },
};

// 複数表示の例
export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ChatIcon />
      <ChatIcon onClose={() => console.log('Chat 1 closed')} />
      <ChatIcon onClose={() => console.log('Chat 2 closed')} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '複数のChatIconを並べて表示した例',
      },
    },
  },
};

// 背景色の確認用
export const OnDarkBackground: Story = {
  render: () => (
    <div style={{ 
      backgroundColor: '#333', 
      padding: '32px', 
      borderRadius: '8px' 
    }}>
      <ChatIcon onClose={() => console.log('Chat closed')} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '暗い背景での表示確認',
      },
    },
  },
};
