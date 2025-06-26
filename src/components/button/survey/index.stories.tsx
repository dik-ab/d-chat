import type { Meta, StoryObj } from '@storybook/nextjs';
import { SurveyButton } from './index';

const meta: Meta<typeof SurveyButton> = {
  title: 'Components/Button/Survey',
  component: SurveyButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['yes', 'no'],
      description: 'ボタンのタイプ（はい/いいえ）',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のハンドラー',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * はいボタンのデフォルト表示
 */
export const Yes: Story = {
  args: {
    type: 'yes',
  },
};

/**
 * いいえボタンのデフォルト表示
 */
export const No: Story = {
  args: {
    type: 'no',
  },
};

/**
 * 両方のボタンを並べて表示
 */
export const Both: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <SurveyButton type="yes" onClick={() => console.log('はいがクリックされました')} />
      <SurveyButton type="no" onClick={() => console.log('いいえがクリックされました')} />
    </div>
  ),
};

/**
 * 横並びで表示
 */
export const Horizontal: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <SurveyButton type="yes" onClick={() => console.log('はいがクリックされました')} />
      <SurveyButton type="no" onClick={() => console.log('いいえがクリックされました')} />
    </div>
  ),
};
