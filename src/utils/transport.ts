import type { AppTheme } from '../config/theme';
import type { TransportationCategory } from '../types';

export const getCategoryColor = (
  theme: AppTheme,
  category: TransportationCategory,
): string => {
  switch (category) {
    case 'jeepney':
      return theme.colors.jeepney;
    case 'modern_jeepney':
      return theme.colors.modernJeepney;
    case 'multicab':
      return theme.colors.multicab;
    case 'tricycle':
      return theme.colors.tricycle;
    case 'bus':
      return theme.colors.bus;
    case 'uv_express':
      return theme.colors.uvExpress;
    case 'van':
      return theme.colors.van;
    case 'ferry':
      return theme.colors.ferry;
    case 'train':
      return theme.colors.train;
    default:
      return theme.colors.primary;
  }
};
