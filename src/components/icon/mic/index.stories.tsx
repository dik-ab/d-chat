import type { Meta, StoryObj } from '@storybook/nextjs';
import { MicIcon } from './index';

const meta: Meta<typeof MicIcon> = {
  title: 'ICON/mic',
  component: MicIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'マイクアイコンコンポーネント。マイクのSVGアイコンを表示します。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 16, max: 200, step: 4 },
      description: 'アイコンのサイズ（px）',
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
    size: 64,
  },
};

// 小さいサイズ
export const Small: Story = {
  args: {
    size: 32,
  },
};

// 大きいサイズ
export const Large: Story = {
  args: {
    size: 128,
  },
};

// サイズ比較
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <MicIcon size={24} />
      <MicIcon size={32} />
      <MicIcon size={48} />
      <MicIcon size={64} />
      <MicIcon size={96} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '異なるサイズのMicIconの比較',
      },
    },
  },
};
