import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { formatRelativeTime } from '../../utils/geo';
import type { Favorite, FavoriteType } from '../../types';

interface FavoriteCardProps {
  favorite: Favorite;
  onPress?: () => void;
  onRemove?: () => void;
}

const TYPE_LABEL: Record<FavoriteType, string> = {
  destination: 'Saved place',
  route: 'Route',
  boarding_point: 'Boarding point',
};

const iconForType = (type: FavoriteType): string => {
  switch (type) {
    case 'destination':
      return 'map-marker-outline';
    case 'route':
      return 'routes';
    case 'boarding_point':
      return 'map-marker-radius-outline';
    default:
      return 'heart-outline';
  }
};

export const favoriteTitle = (favorite: Favorite): string =>
  favorite.label && favorite.label.trim().length > 0
    ? favorite.label
    : TYPE_LABEL[favorite.type];

export const FavoriteCard = ({
  favorite,
  onPress,
  onRemove,
}: FavoriteCardProps) => {
  const theme = useAppTheme();
  const title = favoriteTitle(favorite);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Open ${title}`}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <MaterialCommunityIcons
          name={iconForType(favorite.type)}
          size={20}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.body}>
        <Text
          variant="titleSmall"
          style={{ color: theme.colors.onSurface }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {TYPE_LABEL[favorite.type]} · {favorite.targetId.slice(0, 8)}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.muted }}>
          Saved {formatRelativeTime(favorite.createdAt)}
        </Text>
      </View>

      {onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title} from favorites`}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="heart-remove-outline"
            size={20}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 1,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FavoriteCard;
