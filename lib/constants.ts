import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

export const NAV_THEME = {
  light: {
    background: 'hsl(40 30% 98%)',
    border: 'hsl(150 15% 88%)',
    card: 'hsl(0 0% 100%)',
    notification: 'hsl(0 75% 50%)',
    primary: 'hsl(150 65% 22%)',
    text: 'hsl(150 30% 8%)',
  },
  dark: {
    background: 'hsl(150 25% 7%)',
    border: 'hsl(150 15% 18%)',
    card: 'hsl(150 22% 10%)',
    notification: 'hsl(0 70% 55%)',
    primary: 'hsl(150 55% 55%)',
    text: 'hsl(40 25% 96%)',
  },
};

export const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: { fontFamily: NAV_FONTS.regular, fontWeight: '400' },
    medium: { fontFamily: NAV_FONTS.medium, fontWeight: '500' },
    bold: { fontFamily: NAV_FONTS.bold, fontWeight: '600' },
    heavy: { fontFamily: NAV_FONTS.heavy, fontWeight: '700' },
  },
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: { fontFamily: NAV_FONTS.regular, fontWeight: '400' },
    medium: { fontFamily: NAV_FONTS.medium, fontWeight: '500' },
    bold: { fontFamily: NAV_FONTS.bold, fontWeight: '600' },
    heavy: { fontFamily: NAV_FONTS.heavy, fontWeight: '700' },
  },
  colors: NAV_THEME.dark,
};
