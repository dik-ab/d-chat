import type { Meta, StoryObj } from '@storybook/nextjs';
import { Header } from './index';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'ヘッダーに表示するタイトル',
    },
    onClose: {
      action: 'clicked',
      description: '閉じるボタンがクリックされた時のハンドラー',
    },
    className: {
      control: 'text',
      description: 'カスタムCSSクラス名',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'ヘッダータイトル',
  },
};

export const WithLongTitle: Story = {
  args: {
    title: 'とても長いヘッダータイトルのサンプルテキストです',
  },
};

export const WithoutTitle: Story = {
  args: {
    title: '',
  },
};

export const WithCustomClass: Story = {
  args: {
    title: 'カスタムクラス付きヘッダー',
    className: 'custom-header',
  },
};
