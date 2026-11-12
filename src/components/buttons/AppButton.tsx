import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { useAppTheme } from '../../config/theme';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppButton = ({
  label,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  contentStyle,
  accessibilityLabel,
}: AppButtonProps) => {
  const theme = useAppTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={[
        fullWidth && styles.fullWidth,
        { borderRadius: theme.radius.md },
        style,
      ]}
      contentStyle={[styles.content, contentStyle]}
      labelStyle={styles.label}
    >
      {label}
    </Button>
  );
};

const styles = {
  fullWidth: {
    alignSelf: 'stretch' as const,
  },
  content: {
    minHeight: 50,
    paddingVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
};

export default AppButton;
