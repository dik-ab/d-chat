import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChatBackground } from './index';
import { Box, Typography } from '@mui/material';

const meta: Meta<typeof ChatBackground> = {
  title: 'Components/Background/ChatBackground',
  component: ChatBackground,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
チャット背景コンポーネント

複雑なグラデーション設定を持つチャットUIの背景です。
- 左上から中央・右80%までの放射状グラデーション（白から指定色の70%）
- 右下からも同様の放射状グラデーション  
- 全体に薄いオーバーレイグラデーション（40%透明度）

どんな色を指定しても、自動的に適切な派生色を生成して同様の効果を適用します。
        `,
      },
    },
  },
  argTypes: {
    primaryColor: {
      control: 'color',
      description: 'メインカラー（16進数）',
    },
    width: {
      control: { type: 'number', min: 200, max: 800, step: 25 },
      description: '幅（px）',
    },
    height: {
      control: { type: 'number', min: 400, max: 1000, step: 25 },
      description: '高さ（px）',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// デモ用のコンテンツコンポーネント
const DemoContent = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 2,
      textAlign: 'center',
    }}
  >
    <Typography variant="h4" sx={{ color: '#333', marginBottom: 2, fontWeight: 'bold' }}>
      チャットUI
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', marginBottom: 4 }}>
      複雑なグラデーション背景のデモ
    </Typography>
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="body2" sx={{ color: '#333' }}>
        背景のグラデーション効果を確認できます
      </Typography>
    </Box>
  </Box>
);

export const Default: Story = {
  args: {
    primaryColor: '#00A79E',
    width: 375,
    height: 705,
  },
  render: (args) => (
    <ChatBackground {...args}>
      <DemoContent />
    </ChatBackground>
  ),
};

export const BlueTheme: Story = {
  args: {
    primaryColor: '#007BFF',
    width: 375,
    height: 705,
  },
  render: (args) => (
    <ChatBackground {...args}>
      <DemoContent />
    </ChatBackground>
  ),
};

export const PurpleTheme: Story = {
  args: {
    primaryColor: '#6F42C1',
    width: 375,
    height: 705,
  },
  render: (args) => (
    <ChatBackground {...args}>
      <DemoContent />
    </ChatBackground>
  ),
};

export const RedTheme: Story = {
  args: {
    primaryColor: '#DC3545',
    width: 375,
    height: 705,
  },
  render: (args) => (
    <ChatBackground {...args}>
      <DemoContent />
    </ChatBackground>
  ),
};

export const GreenTheme: Story = {
  args: {
    primaryColor: '#28A745',
    width: 375,
    height: 705,
  },
  render: (args) => (
    <ChatBackground {...args}>
      <DemoContent />
    </ChatBackground>
  ),
};

export const CustomSize: Story = {
  args: {
    primaryColor: '#FF6B35',
    width: 600,
    height: 400,
  },
  render: (args) => (
    <ChatBackground {...args}>
      <DemoContent />
    </ChatBackground>
  ),
};

export const WithoutContent: Story = {
  args: {
    primaryColor: '#00A79E',
    width: 375,
    height: 705,
  },
};

// 複数のテーマを並べて比較
export const ThemeComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {[
        { color: '#00A79E', name: 'Teal' },
        { color: '#007BFF', name: 'Blue' },
        { color: '#6F42C1', name: 'Purple' },
        { color: '#DC3545', name: 'Red' },
        { color: '#28A745', name: 'Green' },
        { color: '#FFC107', name: 'Yellow' },
      ].map((theme) => (
        <Box key={theme.color} sx={{ textAlign: 'center' }}>
          <ChatBackground
            primaryColor={theme.color}
            width={200}
            height={300}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#333',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: 1,
                  borderRadius: 1,
                }}
              >
                {theme.name}
              </Typography>
            </Box>
          </ChatBackground>
          <Typography variant="caption" sx={{ marginTop: 1, display: 'block' }}>
            {theme.color}
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};
