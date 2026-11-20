import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import SegmentedControl from '../../../components/common/SegmentedControl';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/common/StateViews';
import AdvisoryCard from '../../../components/cards/AdvisoryCard';
import ApiBoardingPointCard from '../../../components/cards/ApiBoardingPointCard';
import FareCard from '../../../components/cards/FareCard';
import ServiceAnnouncementCard from '../../../components/cards/ServiceAnnouncementCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  loadAdvisories,
  loadAnnouncements,
  loadBoardingPoints,
  loadFares,
} from '../../../redux/slices/commuterDataSlice';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TransportInfo'>;

type Tab = 'fares' | 'stops' | 'news' | 'alerts';

const TAB_OPTIONS: { label: string; value: Tab }[] = [
  { label: 'Fares', value: 'fares' },
  { label: 'Boarding points', value: 'stops' },
  { label: 'Announcements', value: 'news' },
  { label: 'Advisories', value: 'alerts' },
];

export const TransportInfoScreen = ({ navigation }: Props) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>('fares');

  const { fares, boardingPoints, announcements, advisories } = useAppSelector(
    state => state.commuterData,
  );

  useEffect(() => {
    if (fares.items.length === 0) {
      dispatch(loadFares());
    }
    if (boardingPoints.items.length === 0) {
      dispatch(loadBoardingPoints());
    }
    if (announcements.items.length === 0) {
      dispatch(loadAnnouncements());
    }
    if (advisories.items.length === 0) {
      dispatch(loadAdvisories());
    }
  }, [
    advisories.items.length,
    announcements.items.length,
    boardingPoints.items.length,
    dispatch,
    fares.items.length,
  ]);

  const refresh = useCallback(() => {
    switch (tab) {
      case 'fares':
        dispatch(loadFares());
        break;
      case 'stops':
        dispatch(loadBoardingPoints());
        break;
      case 'news':
        dispatch(loadAnnouncements());
        break;
      case 'alerts':
        dispatch(loadAdvisories());
        break;
      default:
        break;
    }
  }, [dispatch, tab]);

  const activeLoading = (() => {
    switch (tab) {
      case 'fares':
        return fares.loading;
      case 'stops':
        return boardingPoints.loading;
      case 'news':
        return announcements.loading;
      case 'alerts':
        return advisories.loading;
      default:
        return false;
    }
  })();

  const renderResource = <T,>(
    items: T[],
    loading: boolean,
    error: string | null,
    renderItem: (item: T) => React.ReactNode,
    emptyTitle: string,
    emptyMessage: string,
  ) => {
    if (loading && items.length === 0) {
      return <LoadingState message="Loading the latest data…" />;
    }
    if (error && items.length === 0) {
      return <ErrorState message={error} onRetry={refresh} />;
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon="database-off-outline"
          title={emptyTitle}
          message={emptyMessage}
          actionLabel="Refresh"
          onAction={refresh}
        />
      );
    }
    return <View style={styles.list}>{items.map(renderItem)}</View>;
  };

  const renderContent = () => {
    switch (tab) {
      case 'fares':
        return (
          <>
            <Text
              variant="labelSmall"
              style={[styles.count, { color: theme.colors.muted }]}
            >
              {fares.items.length} fare record
              {fares.items.length === 1 ? '' : 's'} from the database
            </Text>
            {renderResource(
              fares.items,
              fares.loading,
              fares.error,
              fare => (
                <FareCard key={fare.id} fare={fare} />
              ),
              'No fares published',
              'Fares added by the transport team will appear here.',
            )}
          </>
        );
      case 'stops':
        return (
          <>
            <Text
              variant="labelSmall"
              style={[styles.count, { color: theme.colors.muted }]}
            >
              {boardingPoints.items.length} boarding point
              {boardingPoints.items.length === 1 ? '' : 's'} from the database
            </Text>
            {renderResource(
              boardingPoints.items,
              boardingPoints.loading,
              boardingPoints.error,
              point => (
                <ApiBoardingPointCard key={point.id} boardingPoint={point} />
              ),
              'No boarding points yet',
              'Boarding points from the transport team will appear here.',
            )}
          </>
        );
      case 'news':
        return (
          <>
            <Text
              variant="labelSmall"
              style={[styles.count, { color: theme.colors.muted }]}
            >
              {announcements.items.length} announcement
              {announcements.items.length === 1 ? '' : 's'} from the database
            </Text>
            {renderResource(
              announcements.items,
              announcements.loading,
              announcements.error,
              announcement => (
                <ServiceAnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ),
              'No announcements yet',
              'Service announcements will appear here when they are published.',
            )}
          </>
        );
      case 'alerts':
        return (
          <>
            <Text
              variant="labelSmall"
              style={[styles.count, { color: theme.colors.muted }]}
            >
              {advisories.items.length}{' '}
              {advisories.items.length === 1 ? 'advisory' : 'advisories'} from
              the database
            </Text>
            {renderResource(
              advisories.items,
              advisories.loading,
              advisories.error,
              advisory => (
                <AdvisoryCard key={advisory.id} advisory={advisory} />
              ),
              'No active advisories',
              'Service advisories will appear here when they are published.',
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Transport info"
        subtitle="Live fares, stops and service updates"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.tabWrap}>
        <SegmentedControl options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={activeLoading}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  count: {
    marginBottom: 10,
  },
  list: {
    gap: 2,
  },
});

export default TransportInfoScreen;
