import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '../src/config/theme';
import MapLibreMap from '../src/components/maps/MapLibreMap';
import type { Route } from '../src/types';

const route: Route = {
  id: 'route_1',
  routeCode: 'CDO-JEEP-01',
  routeName: 'Divisoria Loop',
  origin: 'Divisoria',
  destination: 'Cogon',
  transportationType: 'jeepney',
  status: 'active',
  fare: 9,
  estimatedDuration: 25,
  stops: [
    {
      id: 'stop_1',
      name: 'Divisoria',
      sequence: 1,
      latitude: 8.4822,
      longitude: 124.6472,
      stopType: 'boarding',
    },
    {
      id: 'stop_2',
      name: 'Cogon',
      sequence: 2,
      latitude: 8.49,
      longitude: 124.655,
      stopType: 'dropoff',
    },
  ],
};

const renderMap = (element: React.ReactElement) =>
  render(<PaperProvider theme={lightTheme}>{element}</PaperProvider>);

describe('MapLibreMap', () => {
  it('renders a MapLibre map with route lines, points, and a recenter control', async () => {
    const tree = await renderMap(
      <MapLibreMap
        routes={[route]}
        selectedRouteId={route.id}
        location={{ latitude: 8.4822, longitude: 124.6472 }}
      />,
    );

    expect(tree.getByTestId('maplibre-map')).toBeTruthy();
    expect(tree.getByLabelText('Recenter map')).toBeTruthy();
  });

  it('renders without routes or a device location', async () => {
    const tree = await renderMap(<MapLibreMap />);
    expect(tree.getByTestId('maplibre-map')).toBeTruthy();
  });

  it('shows every route when no route is selected', async () => {
    const otherRoute: Route = {
      ...route,
      id: 'route_2',
      routeCode: 'CDO-BUS-02',
      routeName: 'Cogon Loop',
      stops: [
        {
          id: 'stop_3',
          name: 'Cogon',
          sequence: 1,
          latitude: 8.5,
          longitude: 124.66,
          stopType: 'boarding',
        },
        {
          id: 'stop_4',
          name: 'Gusa',
          sequence: 2,
          latitude: 8.52,
          longitude: 124.67,
          stopType: 'dropoff',
        },
      ],
    };

    const tree = await renderMap(
      <MapLibreMap routes={[route, otherRoute]} selectedRouteId={null} />,
    );

    const source = tree.getByTestId('byaheko-routes-source');
    expect(source.props.data.features).toHaveLength(2);
  });

  it('shows only the selected route and hides unrelated stops', async () => {
    const otherRoute: Route = {
      ...route,
      id: 'route_2',
      routeCode: 'CDO-BUS-02',
      routeName: 'Cogon Loop',
      stops: [
        {
          id: 'stop_3',
          name: 'Cogon',
          sequence: 1,
          latitude: 8.5,
          longitude: 124.66,
          stopType: 'boarding',
        },
        {
          id: 'stop_4',
          name: 'Gusa',
          sequence: 2,
          latitude: 8.52,
          longitude: 124.67,
          stopType: 'dropoff',
        },
      ],
    };

    const tree = await renderMap(
      <MapLibreMap
        routes={[route, otherRoute]}
        selectedRouteId={route.id}
      />,
    );

    const lines = tree.getByTestId('byaheko-routes-source').props.data;
    expect(lines.features).toHaveLength(1);
    expect(lines.features[0].properties.routeId).toBe(route.id);

    const points = tree.getByTestId('byaheko-points-source').props.data;
    expect(points.features.every((feature: { properties: { routeId: string } }) =>
      feature.properties.routeId === route.id,
    )).toBe(true);
  });
});
