import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../config/theme';
import { formatFare, formatRelativeTime } from '../../utils/geo';
import type { ApiFare } from '../../services/api/types';

interface FareCardProps {
  fare: ApiFare;
}

const shortId = (id: string | null): string =>
  id ? id.slice(0, 8) : 'Not linked';

const formatAmount = (fare: ApiFare): string =>
  fare.currency === 'PHP' || !fare.currency
    ? formatFare(fare.amount)
    : `${fare.currency} ${fare.amount.toFixed(2)}`;

export const FareCard = ({ fare }: FareCardProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <MaterialCommunityIcons
          name="cash-multiple"
          size={20}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant="titleMedium"
            style={[styles.flex, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {formatAmount(fare)}
          </Text>
          {fare.isRoundtrip ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSecondaryContainer }}
              >
                Round trip
              </Text>
            </View>
          ) : null}
        </View>

        {fare.description ? (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={2}
          >
            {fare.description}
          </Text>
        ) : null}

        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          Route {shortId(fare.routeId)} · Stop {shortId(fare.boardingPointId)}
        </Text>

        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: fare.isVerified
                  ? `${theme.colors.success}1A`
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: fare.isVerified
                  ? theme.colors.success
                  : theme.colors.onSurfaceVariant,
              }}
            >
              {fare.isVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
          {fare.transportationTypeId ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {shortId(fare.transportationTypeId)}
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="labelSmall" style={{ color: theme.colors.muted }}>
          Updated {formatRelativeTime(fare.updatedAt)}
          {fare.sourceName ? ` · ${fare.sourceName}` : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

export default FareCard;
