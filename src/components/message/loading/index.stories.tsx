import type { Meta, StoryObj } from '@storybook/nextjs';
import { LoadingMessage } from './index';

const meta: Meta<typeof LoadingMessage> = {
  title: 'Components/Message/Loading',
  component: LoadingMessage,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    backgroundColor: {
      control: 'color',
      description: 'メッセージの背景色',
    },
    iconUrl: {
      control: 'text',
      description: 'アイコンのURL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingMessage>;

export const Default: Story = {
  args: {
    backgroundColor: '#1976d2',
  },
};

export const CustomColor: Story = {
  args: {
    backgroundColor: '#4caf50',
  },
};

export const RedColor: Story = {
  args: {
    backgroundColor: '#f44336',
  },
};

export const PurpleColor: Story = {
  args: {
    backgroundColor: '#9c27b0',
  },
};

export const InChatContext: Story = {
  args: {
    backgroundColor: '#1976d2',
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
