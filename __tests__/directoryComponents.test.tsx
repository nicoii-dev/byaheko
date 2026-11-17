import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '../src/config/theme';
import DirectoryCategoryCard from '../src/components/cards/DirectoryCategoryCard';
import RouteListCard from '../src/components/cards/RouteListCard';
import type { CategorySummary } from '../src/utils/transport';
import type { Route, Transportation } from '../src/types';

const category: Transportation = {
  id: 'cat_jeepney',
  name: 'Jeepney',
  category: 'jeepney',
  icon: 'bus',
  description: 'Traditional Philippine jeepney',
};

const summary: CategorySummary = {
  routeCount: 2,
  activeRouteCount: 2,
  boardingPointCount: 3,
  minFare: 13,
  maxFare: 25,
};

const route: Route = {
  id: 'route_1',
  routeCode: 'DEMO-01',
  routeName: 'Demo jeepney route',
  origin: 'Origin',
  destination: 'Destination',
  transportationType: 'jeepney',
  stops: [
    {
      id: 'stop_1',
      name: 'Origin',
      sequence: 1,
      latitude: 8.48,
      longitude: 124.64,
      stopType: 'boarding',
    },
    {
      id: 'stop_2',
      name: 'Destination',
      sequence: 2,
      latitude: 8.49,
      longitude: 124.65,
      stopType: 'dropoff',
    },
  ],
  fare: 13,
  estimatedDuration: 20,
  status: 'active',
  isDemoData: true,
};

const renderWithTheme = (element: React.ReactElement) =>
  render(<PaperProvider theme={lightTheme}>{element}</PaperProvider>);

describe('transportation directory components', () => {
  it('shows category counts and opens the category', async () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = await renderWithTheme(
      <DirectoryCategoryCard
        category={category}
        summary={summary}
        onPress={onPress}
      />,
    );

    expect(getByText('Jeepney')).toBeTruthy();
    expect(getByText('Traditional Philippine jeepney')).toBeTruthy();
    expect(getByText('2 routes · 3 stops')).toBeTruthy();
    expect(getByText('₱13 – ₱25')).toBeTruthy();

    await fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows route details and opens the route', async () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = await renderWithTheme(
      <RouteListCard route={route} onPress={onPress} />,
    );

    expect(getByText('DEMO-01')).toBeTruthy();
    expect(getByText('Demo jeepney route')).toBeTruthy();
    expect(getByText('Origin → Destination')).toBeTruthy();
    expect(getByText('20 min · ₱13')).toBeTruthy();

    await fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits the fare range when a category has no routes', async () => {
    const { queryByText } = await renderWithTheme(
      <DirectoryCategoryCard
        category={category}
        summary={{
          routeCount: 0,
          activeRouteCount: 0,
          boardingPointCount: 0,
          minFare: null,
          maxFare: null,
        }}
        onPress={jest.fn()}
      />,
    );

    expect(queryByText('0 routes · 0 stops')).toBeTruthy();
    expect(queryByText(/₱/)).toBeNull();
  });
});
