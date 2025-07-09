import type { Meta, StoryObj } from '@storybook/nextjs';
import { LoadingMessage } from './index';

const meta: Meta<typeof LoadingMessage> = {
  title: 'Components/Message/Loading',
  component: LoadingMessage,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    color: {
      control: 'color',
      description: 'メッセージの背景色とアイコンの色',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingMessage>;

export const Default: Story = {
  args: {
    color: '#1976d2',
  },
};

export const CustomColor: Story = {
  args: {
    color: '#4caf50',
  },
};

export const RedColor: Story = {
  args: {
    color: '#f44336',
  },
};

export const PurpleColor: Story = {
  args: {
    color: '#9c27b0',
  },
};

export const InChatContext: Story = {
  args: {
    color: '#1976d2',
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '374px', 
        padding: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <Story />
      </div>
    ),
  ],
};
