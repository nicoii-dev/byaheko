import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';

export type InfoBannerTone = 'info' | 'success' | 'warning' | 'error';

interface InfoBannerProps {
  message: string;
  tone?: InfoBannerTone;
  actionLabel?: string;
  onAction?: () => void;
}

const toneIcon: Record<InfoBannerTone, string> = {
  info: 'information-outline',
  success: 'check-circle-outline',
  warning: 'alert-outline',
  error: 'alert-circle-outline',
};

export const InfoBanner = ({
  message,
  tone = 'info',
  actionLabel,
  onAction,
}: InfoBannerProps) => {
  const theme = useAppTheme();
  const colors = {
    info: {
      background: theme.colors.secondaryContainer,
      foreground: theme.colors.onSecondaryContainer,
    },
    success: {
      background: theme.colors.primaryContainer,
      foreground: theme.colors.onPrimaryContainer,
    },
    warning: {
      background: theme.colors.tertiaryContainer,
      foreground: theme.colors.onTertiaryContainer,
    },
    error: {
      background: theme.colors.errorContainer,
      foreground: theme.colors.onErrorContainer,
    },
  }[tone];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessibilityLiveRegion="polite"
    >
      <MaterialCommunityIcons
        name={toneIcon[tone]}
        size={18}
        color={colors.foreground}
      />
      <Text
        variant="bodySmall"
        style={[styles.message, { color: colors.foreground }]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
        >
          <Text
            variant="labelLarge"
            style={[styles.action, { color: colors.foreground }]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  message: {
    flex: 1,
  },
  action: {
    fontWeight: '700',
  },
});

export default InfoBanner;
