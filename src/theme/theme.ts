import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: {
      primary: string;
      secondary: string;
    };
  }

  interface PaletteOptions {
    brand?: {
      primary?: string;
      secondary?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    brand: {
      primary: '#00A79E', // メインブランドカラー
      secondary: '#72777A', // セカンダリカラー
    },
    primary: {
      main: '#00A79E',
    },
    secondary: {
      main: '#72777A',
    },
  },
});

export default theme;
