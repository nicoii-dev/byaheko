import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#163D32',
    secondary: '#B8E65A',
    accent: '#F5B942',
    background: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceVariant: '#E8E8E3',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E5E0',
    error: '#E53935',
    success: '#2E7D52',
    warning: '#F5B942',
    jeepney: '#F5B942',
    bus: '#4A90D9',
    uvExpress: '#9B59B6',
    train: '#34495E',
    ferry: '#16A085',
    tricycle: '#E67E22',
    modernJeepney: '#2ECC71',
    multicab: '#3498DB',
    van: '#95A5A6',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#B8E65A',
    secondary: '#163D32',
    accent: '#F5B942',
    background: '#121A16',
    surface: '#1E2A24',
    surfaceVariant: '#2A3A32',
    text: '#F5F5F0',
    textSecondary: '#A3B1A6',
    border: '#2A3A32',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#F5B942',
    jeepney: '#F5B942',
    bus: '#64B5F6',
    uvExpress: '#BA68C8',
    train: '#B0BEC5',
    ferry: '#80CBC4',
    tricycle: '#FFB74D',
    modernJeepney: '#81C784',
    multicab: '#64B5F6',
    van: '#90A4AE',
  },
};

export type Theme = typeof lightTheme;