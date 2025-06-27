import type { Meta, StoryObj } from '@storybook/nextjs';
import { CompanyMessage } from './index';

const meta: Meta<typeof CompanyMessage> = {
  title: 'Components/Message/Company',
  component: CompanyMessage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
企業側が送信したメッセージを表示するコンポーネントです。
アイコン付きで吹き出しデザインになっています。

## 仕様
- メインカラーから背景色とアイコン背景色を動的に生成
- チャット背景: mix(白, メイン, 0.75)
- アイコン背景: 彩度 +10%, 明度 +10%
- 幅: 228px
- 高さ: コンテンツに応じて自動調整
- border-radius: 32px
- padding: 16px
- フォント: Noto Sans, 14px, weight 500
- 行間: 21px
- 左寄せ表示（アイコン付き）
- 吹き出し三角形: 左上、radius 3px
        `,
      },
    },
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'メッセージテキスト',
    },
    color: {
      control: 'color',
      description: 'メインカラー（このカラーから背景色とアイコン背景色を動的に生成）',
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
    message: 'こんにちは！何かお手伝いできることはありますか？',
  },
};

export const CustomColor: Story = {
  args: {
    message: 'カスタムカラーのメッセージです。',
    color: '#2196F3',
  },
  parameters: {
    docs: {
      description: {
        story: 'カスタムカラーを指定した表示例です。背景色とアイコン色が動的に生成されます。',
      },
    },
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'はい',
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
    message: 'これは長いメッセージの例です。複数行にわたって表示される場合のレイアウトを確認できます。テキストは自動的に折り返されて表示されます。吹き出しの三角形も適切に配置されています。',
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
    message: 'お疲れ様です。\n\n以下の点についてご確認ください：\n1. 資料の準備\n2. 会議の時間\n3. 参加者の確認\n\nよろしくお願いします。',
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
    message: 'ご質問ありがとうございます！😊\n喜んでお答えします！✨',
  },
  parameters: {
    docs: {
      description: {
        story: '絵文字を含むメッセージの表示例です。',
      },
    },
  },
};

export const GreenTheme: Story = {
  args: {
    message: 'グリーンテーマのメッセージです。',
    color: '#4CAF50',
  },
  parameters: {
    docs: {
      description: {
        story: 'グリーンテーマでの表示例です。',
      },
    },
  },
};

export const PurpleTheme: Story = {
  args: {
    message: 'パープルテーマのメッセージです。',
    color: '#9C27B0',
  },
  parameters: {
    docs: {
      description: {
        story: 'パープルテーマでの表示例です。',
      },
    },
  },
};

// チャット風のレイアウト例
export const ChatLayout: Story = {
  render: () => (
    <div style={{ width: '300px', padding: '16px', backgroundColor: '#f5f5f5' }}>
      <CompanyMessage message="こんにちは！" />
      <CompanyMessage 
        message="何かお手伝いできることはありますか？" 
        color="#2196F3"
      />
      <CompanyMessage message="お気軽にお声がけください！😊" />
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
