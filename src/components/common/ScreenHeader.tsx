import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightBadge?: number;
}

export const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
  rightBadge,
}: ScreenHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
      ) : null}
      <View style={styles.titleContainer}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onBackground }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightIcon && onRightPress ? (
        <TouchableOpacity
          onPress={onRightPress}
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          accessibilityRole="button"
          accessibilityLabel={rightAccessibilityLabel ?? 'More actions'}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={rightIcon}
            size={22}
            color={theme.colors.onSurface}
          />
          {rightBadge && rightBadge > 0 ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.error },
              ]}
            >
              <Text style={styles.badgeText}>
                {rightBadge > 9 ? '9+' : rightBadge}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ScreenHeader;
