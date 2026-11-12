import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../../config/theme';
import Screen from '../../../components/common/Screen';
import ScreenHeader from '../../../components/common/ScreenHeader';
import AppButton from '../../../components/buttons/AppButton';
import TransportMap from '../../../components/maps/TransportMap';
import TransportBadge from '../../../components/common/TransportBadge';
import { EmptyState } from '../../../components/common/StateViews';
import { useAppSelector } from '../../../redux/hooks';
import { formatDistance, formatDuration, formatFare } from '../../../utils/geo';
import type { RootStackParamList } from '../../../navigation/types';
import type { BoardingPoint } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Navigation'>;

export const NavigationScreen = ({ navigation, route }: Props) => {
  const theme = useAppTheme();
  const [stepIndex, setStepIndex] = useState(0);

  const routeOptions = useAppSelector(state => state.routes.routeOptions);
  const selectedOption = useAppSelector(
    state => state.routes.selectedRouteOption,
  );
  const routes = useAppSelector(state => state.routes.routes);

  const option = useMemo(() => {
    const optionId = route.params?.optionId;
    if (optionId) {
      return routeOptions.find(item => item.id === optionId) ?? null;
    }
    return selectedOption;
  }, [route.params?.optionId, routeOptions, selectedOption]);

  const routeStops = useMemo(() => {
    const firstRouteId = option?.routeIds[0];
    return routes.find(item => item.id === firstRouteId)?.stops ?? [];
  }, [option?.routeIds, routes]);

  const mapPoints = useMemo<BoardingPoint[]>(() => {
    if (!option) {
      return [];
    }
    const points = [
      option.boardingPoint,
      ...option.transferPoints,
      option.dropoffPoint,
    ];
    const seen = new Set<string>();
    return points.filter(point => {
      if (seen.has(point.id)) {
        return false;
      }
      seen.add(point.id);
      return true;
    });
  }, [option]);

  if (!option) {
    return (
      <Screen>
        <ScreenHeader title="Navigation" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="navigation-variant-outline"
          title="Nothing to navigate"
          message="Choose a route option first, then start navigation from its details."
          actionLabel="Plan a trip"
          onAction={() => navigation.navigate('Main', { screen: 'PlanTrip' })}
        />
      </Screen>
    );
  }

  const steps = option.steps;
  if (steps.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Navigation" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="map-marker-question-outline"
          title="No guidance available"
          message="This demonstration route option has no step-by-step directions yet."
          actionLabel="Back to route details"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex >= steps.length - 1;
  const progress = (stepIndex + 1) / Math.max(1, steps.length);

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Trip guidance"
        subtitle={option.summary}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.demoNotice,
            { backgroundColor: theme.colors.tertiaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={theme.colors.onTertiaryContainer}
          />
          <Text
            variant="bodySmall"
            style={[styles.flex, { color: theme.colors.onTertiaryContainer }]}
          >
            Simulated trip guidance. This build does not track live vehicles or
            provide real-time arrival data.
          </Text>
        </View>

        <TransportMap
          location={null}
          center={option.boardingPoint}
          boardingPoints={mapPoints}
          routeStops={routeStops}
          showRecenter={false}
          style={styles.map}
        />

        <View style={styles.progressHeader}>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Step {stepIndex + 1} of {steps.length}
          </Text>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.primary }}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progress}
        />

        <View
          style={[
            styles.stepCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepIcon,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name={currentStep.transportationType ? 'bus-side' : 'walk'}
                size={26}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.stepTitleWrap}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {currentStep.transportationType
                  ? 'Ride'
                  : 'Walk'}
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.bold, { color: theme.colors.onSurface }]}
              >
                {currentStep.routeName ?? 'On foot'}
              </Text>
            </View>
          </View>
          <Text
            variant="bodyLarge"
            style={[styles.instruction, { color: theme.colors.onSurface }]}
          >
            {currentStep.instruction}
          </Text>
          <View style={styles.stepMetrics}>
            {currentStep.duration ? (
              <View style={styles.metric}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  {formatDuration(currentStep.duration)}
                </Text>
              </View>
            ) : null}
            {currentStep.distance ? (
              <View style={styles.metric}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  {formatDistance(currentStep.distance)}
                </Text>
              </View>
            ) : null}
            {currentStep.fare ? (
              <View style={styles.metric}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  {formatFare(currentStep.fare)}
                </Text>
              </View>
            ) : null}
          </View>
          {currentStep.transportationType ? (
            <TransportBadge category={currentStep.transportationType} />
          ) : null}
        </View>

        <View style={styles.upNext}>
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.onBackground }}
          >
            Up next
          </Text>
          {isLast ? (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              You have reached the final step of this demonstration trip.
            </Text>
          ) : (
            steps.slice(stepIndex + 1).map(step => (
              <View key={step.id} style={styles.nextRow}>
                <MaterialCommunityIcons
                  name="circle-small"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.flex, { color: theme.colors.onSurfaceVariant }]}
                >
                  {step.instruction}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.actions}>
          <AppButton
            label="Previous"
            mode="outlined"
            onPress={() => setStepIndex(index => Math.max(0, index - 1))}
            disabled={stepIndex === 0}
            icon="arrow-left"
          />
          {isLast ? (
            <AppButton
              label="End trip"
              onPress={() => navigation.goBack()}
              icon="flag-checkered"
            />
          ) : (
            <AppButton
              label="Next step"
              onPress={() =>
                setStepIndex(index => Math.min(steps.length - 1, index + 1))
              }
              icon="arrow-right"
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  demoNotice: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  map: {
    height: 230,
    borderRadius: 18,
    marginBottom: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 18,
  },
  stepCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleWrap: {
    flex: 1,
    gap: 1,
  },
  flex: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  instruction: {
    lineHeight: 24,
  },
  stepMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upNext: {
    marginTop: 24,
    gap: 8,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  actions: {
    gap: 10,
    marginTop: 24,
  },
});

export default NavigationScreen;
