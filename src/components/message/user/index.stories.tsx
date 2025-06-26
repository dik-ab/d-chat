import type { Meta, StoryObj } from '@storybook/nextjs';
import { UserMessage } from './index';

const meta: Meta<typeof UserMessage> = {
  title: 'Components/Message/User',
  component: UserMessage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
ユーザーが送信したメッセージを表示するコンポーネントです。

## 仕様
- 背景色: #D2E5DE
- 幅: 228px
- 高さ: コンテンツに応じて自動調整
- border-radius: 32px
- padding: 16px
- フォント: Noto Sans, 14px, weight 500
- 行間: 21px
- 右寄せ表示
        `,
      },
    },
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'メッセージテキスト',
    },
    className: {
      control: 'text',
      description: 'カスタムクラス名',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'こんにちは！',
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'OK',
  },
  parameters: {
    docs: {
      description: {
        story: '短いメッセージの表示例です。',
      },
    },
  },
};

export const LongMessage: Story = {
  args: {
    message: 'これは長いメッセージの例です。複数行にわたって表示される場合のレイアウトを確認できます。テキストは自動的に折り返されて表示されます。',
  },
  parameters: {
    docs: {
      description: {
        story: '長いメッセージの表示例です。テキストが自動的に折り返されます。',
      },
    },
  },
};

export const MultilineMessage: Story = {
  args: {
    message: '1行目のメッセージです。\n2行目のメッセージです。\n3行目のメッセージです。',
  },
  parameters: {
    docs: {
      description: {
        story: '改行を含むメッセージの表示例です。',
      },
    },
  },
};

export const EmojiMessage: Story = {
  args: {
    message: 'ありがとうございます！😊🎉',
  },
  parameters: {
    docs: {
      description: {
        story: '絵文字を含むメッセージの表示例です。',
      },
    },
  },
};

// チャット風のレイアウト例
export const ChatLayout: Story = {
  render: () => (
    <div style={{ width: '300px', padding: '16px', backgroundColor: '#f5f5f5' }}>
      <UserMessage message="こんにちは！" />
      <UserMessage message="今日はいい天気ですね。" />
      <UserMessage message="お疲れ様でした！😊" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'チャット風のレイアウトでの表示例です。複数のメッセージが連続して表示されます。',
      },
    },
  },
};
