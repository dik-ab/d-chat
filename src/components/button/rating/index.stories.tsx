import type { Meta, StoryObj } from '@storybook/nextjs';
import { RatingButtons } from './index';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme/theme';

const meta: Meta<typeof RatingButtons> = {
  title: 'Components/Button/Rating',
  component: RatingButtons,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#333333' },
        { name: 'brand', value: '#00A79E' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    matchedMessage: {
      control: 'text',
      description: '成功時メッセージ（matched_message）',
    },
    unmatchedMessage: {
      control: 'text',
      description: '失敗時メッセージ（unmatched_message）',
    },
    conversationState: {
      control: { type: 'select' },
      options: ['top1', 'top3', 'unmatched'],
      description: '会話の状態',
    },
    contactPageUrl: {
      control: 'text',
      description: '問い合わせページURL',
    },
    onRating: {
      action: 'rating',
      description: '評価ボタンクリック時のハンドラー',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 成功時（top1）のデフォルト表示
 */
export const SuccessTop1: Story = {
  args: {
    matchedMessage: 'ご質問にお答えできました。お役に立てて嬉しいです。',
    unmatchedMessage: '申し訳ございませんが、適切な回答を見つけることができませんでした。',
    conversationState: 'top1',
    contactPageUrl: null,
    onRating: (ratingType) => console.log(`評価: ${ratingType}`),
  },
};

/**
 * 成功時（top3）のデフォルト表示
 */
export const SuccessTop3: Story = {
  args: {
    matchedMessage: 'いくつかの候補をご提案させていただきました。参考になりましたでしょうか。',
    unmatchedMessage: '申し訳ございませんが、適切な回答を見つけることができませんでした。',
    conversationState: 'top3',
    contactPageUrl: null,
    onRating: (ratingType) => console.log(`評価: ${ratingType}`),
  },
};

/**
 * 失敗時（unmatched）のデフォルト表示
 */
export const Unmatched: Story = {
  args: {
    matchedMessage: 'ご質問にお答えできました。お役に立てて嬉しいです。',
    unmatchedMessage: '申し訳ございませんが、適切な回答を見つけることができませんでした。より詳しいサポートが必要でしたら、お気軽にお問い合わせください。',
    conversationState: 'unmatched',
    contactPageUrl: null,
    onRating: (ratingType) => console.log(`評価: ${ratingType}`),
  },
};

/**
 * 問い合わせページリンク付きの表示
 */
export const WithContactLink: Story = {
  args: {
    matchedMessage: 'ご質問にお答えできました。お役に立てて嬉しいです。',
    unmatchedMessage: '申し訳ございませんが、適切な回答を見つけることができませんでした。より詳しいサポートが必要でしたら、下記のリンクからお問い合わせください。',
    conversationState: 'unmatched',
    contactPageUrl: 'https://example.com/contact',
    onRating: (ratingType) => console.log(`評価: ${ratingType}`),
  },
};

/**
 * 長いメッセージの表示例
 */
export const LongMessage: Story = {
  args: {
    matchedMessage: 'ご質問にお答えできました。\n\n詳細な情報をご提供できたかと思います。\n今後ともどうぞよろしくお願いいたします。\n\nさらにご不明な点がございましたら、いつでもお気軽にお声がけください。',
    unmatchedMessage: '申し訳ございませんが、適切な回答を見つけることができませんでした。\n\nお客様のご質問は非常に専門的な内容のようです。\nより詳しいサポートが必要でしたら、専門スタッフが対応いたしますので、お問い合わせページからご連絡ください。',
    conversationState: 'top1',
    contactPageUrl: 'https://example.com/contact',
    onRating: (ratingType) => console.log(`評価: ${ratingType}`),
  },
};

/**
 * 評価完了後の状態をシミュレート
 */
export const RatedState: Story = {
  args: {
    matchedMessage: 'ご質問にお答えできました。お役に立てて嬉しいです。',
    unmatchedMessage: '申し訳ございませんが、適切な回答を見つけることができませんでした。',
    conversationState: 'top1',
    contactPageUrl: null,
    onRating: (ratingType) => console.log(`評価: ${ratingType}`),
  },
  render: (args) => {
    // 評価済み状態をシミュレートするため、カスタムレンダリング
    return (
      <div>
        <div style={{ 
          color: '#FFFFFF', 
          lineHeight: 1.5, 
          marginBottom: '16px', 
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 500,
        }}>
          {args.matchedMessage}
        </div>
        <div style={{ 
          color: '#FFFFFF', 
          lineHeight: 1.5, 
          marginBottom: '16px', 
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 500,
        }}>
          お問合せいただきありがとうございました。品質向上のため、よろしければ以下のボタンから評価をお願いいたします。
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          fontWeight: 500,
          fontStyle: 'italic',
        }}>
          評価いただき、ありがとうございました。
        </div>
      </div>
    );
  },
};

/**
 * 全パターンの比較表示
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '16px' }}>成功時（Top1）</h3>
        <RatingButtons
          matchedMessage="ご質問にお答えできました。お役に立てて嬉しいです。"
          unmatchedMessage="申し訳ございませんが、適切な回答を見つけることができませんでした。"
          conversationState="top1"
          contactPageUrl={null}
          onRating={(ratingType) => console.log(`Top1評価: ${ratingType}`)}
        />
      </div>
      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '16px' }}>成功時（Top3）</h3>
        <RatingButtons
          matchedMessage="いくつかの候補をご提案させていただきました。参考になりましたでしょうか。"
          unmatchedMessage="申し訳ございませんが、適切な回答を見つけることができませんでした。"
          conversationState="top3"
          contactPageUrl={null}
          onRating={(ratingType) => console.log(`Top3評価: ${ratingType}`)}
        />
      </div>
      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '16px' }}>失敗時（Unmatched）</h3>
        <RatingButtons
          matchedMessage="ご質問にお答えできました。お役に立てて嬉しいです。"
          unmatchedMessage="申し訳ございませんが、適切な回答を見つけることができませんでした。"
          conversationState="unmatched"
          contactPageUrl="https://example.com/contact"
          onRating={(ratingType) => console.log(`Unmatched評価: ${ratingType}`)}
        />
      </div>
    </div>
  ),
};
