import type { Meta, StoryObj } from '@storybook/nextjs';
import { RobotIcon } from './index';

const meta: Meta<typeof RobotIcon> = {
  title: 'ICON/robot',
  component: RobotIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ロボットアイコンコンポーネント。丸い背景にグラデーションを適用し、中央にロボットのSVGアイコンを表示します。背景色を指定すると、自動的に適切なグラデーションが生成されます。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 16, max: 200, step: 4 },
      description: 'アイコンのサイズ（px）',
    },
    backgroundColor: {
      control: { type: 'color' },
      description: '背景色（グラデーションの開始色）',
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
    backgroundColor: '#C3E5E3',
  },
};

// 小さいサイズ
export const Small: Story = {
  args: {
    size: 32,
    backgroundColor: '#C3E5E3',
  },
};

// 大きいサイズ
export const Large: Story = {
  args: {
    size: 128,
    backgroundColor: '#C3E5E3',
  },
};

// 異なる背景色のバリエーション
export const BlueVariant: Story = {
  args: {
    size: 64,
    backgroundColor: '#A8D8EA',
  },
};

export const PurpleVariant: Story = {
  args: {
    size: 64,
    backgroundColor: '#D4A5D4',
  },
};

export const OrangeVariant: Story = {
  args: {
    size: 64,
    backgroundColor: '#FFD3A5',
  },
};

export const GreenVariant: Story = {
  args: {
    size: 64,
    backgroundColor: '#A8E6A3',
  },
};

// サイズ比較
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <RobotIcon size={24} backgroundColor="#C3E5E3" />
      <RobotIcon size={32} backgroundColor="#C3E5E3" />
      <RobotIcon size={48} backgroundColor="#C3E5E3" />
      <RobotIcon size={64} backgroundColor="#C3E5E3" />
      <RobotIcon size={96} backgroundColor="#C3E5E3" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '異なるサイズのRobotIconの比較',
      },
    },
  },
};

// カラーバリエーション
export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      <RobotIcon size={64} backgroundColor="#C3E5E3" />
      <RobotIcon size={64} backgroundColor="#A8D8EA" />
      <RobotIcon size={64} backgroundColor="#D4A5D4" />
      <RobotIcon size={64} backgroundColor="#FFD3A5" />
      <RobotIcon size={64} backgroundColor="#A8E6A3" />
      <RobotIcon size={64} backgroundColor="#F5A5A5" />
      <RobotIcon size={64} backgroundColor="#E6E6FA" />
      <RobotIcon size={64} backgroundColor="#F0E68C" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '様々な背景色のRobotIcon。各色から自動的にグラデーションが生成されます。',
      },
    },
  },
};

// グラデーション効果の説明
export const GradientEffect: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <RobotIcon size={96} backgroundColor="#C3E5E3" />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>
          開始色: #C3E5E3<br />
          終了色: #50BEB9 (自動生成)
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <RobotIcon size={96} backgroundColor="#FFD3A5" />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>
          開始色: #FFD3A5<br />
          終了色: #CCA984 (自動生成)
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'グラデーション効果の例。指定した色から約20%暗い色が自動的に生成されます。',
      },
    },
  },
};
