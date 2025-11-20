// Design System & Theme Colors
export const colors = {
  // Primary Colors
  primary: '#1890FF', // Ocean Blue
  primaryDark: '#0050B3',
  primaryLight: '#40A9FF',
  
  // Secondary Colors
  secondary: '#FF8C00', // Energy Orange
  secondaryDark: '#AD4E00',
  secondaryLight: '#FFC069',
  
  // Gradient Colors
  gradientStart: '#1890FF',
  gradientEnd: '#FF8C00',
  
  // Status Colors
  success: '#52C41A',
  error: '#FF4D4F',
  warning: '#FAAD14',
  info: '#1890FF',
  
  // Neutral Colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  // Auction Specific
  auctionLive: '#FF4D4F',
  auctionScheduled: '#FAAD14',
  auctionEnded: '#8C8C8C',
  
  // Wallet
  walletPositive: '#52C41A',
  walletNegative: '#FF4D4F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

