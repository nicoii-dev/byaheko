import React from 'react';
import { act, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import OpenStreetMap from '../src/components/maps/OpenStreetMap';
import { lightTheme } from '../src/config/theme';
import type { BoardingPoint } from '../src/types';

const boardingPoint: BoardingPoint = {
  id: 'bp_1',
  name: 'Demo boarding point',
  address: 'Demo address',
  latitude: 8.4822,
  longitude: 124.6472,
  transportationTypes: ['jeepney'],
  routeIds: ['route_1'],
};

const renderWithTheme = (element: React.ReactElement) =>
  render(<PaperProvider theme={lightTheme}>{element}</PaperProvider>);

describe('OpenStreetMap', () => {
  it('renders OSM tiles, the required attribution, and marker data', async () => {
    const { getByLabelText } = await renderWithTheme(
      <OpenStreetMap
        center={{ latitude: 8.4822, longitude: 124.6472 }}
        boardingPoints={[boardingPoint]}
      />,
    );

    const map = getByLabelText('OpenStreetMap map');
    const html = map.props.source.html as string;

    expect(html).toContain('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(html).toContain('OpenStreetMap</a> contributors');
    expect(html).toContain(boardingPoint.name);
  });

  it('notifies the screen when a boarding-point marker is pressed', async () => {
    const onSelectBoardingPoint = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <OpenStreetMap
        center={{ latitude: 8.4822, longitude: 124.6472 }}
        boardingPoints={[boardingPoint]}
        onSelectBoardingPoint={onSelectBoardingPoint}
      />,
    );

    const map = getByLabelText('OpenStreetMap map');

    await act(async () => {
      map.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            type: 'boardingPointPress',
            payload: { id: boardingPoint.id },
          }),
        },
      });
    });

    expect(onSelectBoardingPoint).toHaveBeenCalledWith(boardingPoint);
  });

  it('can hide the recenter control', async () => {
    const { queryByLabelText } = await renderWithTheme(
      <OpenStreetMap
        center={{ latitude: 8.4822, longitude: 124.6472 }}
        showRecenter={false}
      />,
    );

    expect(queryByLabelText('Recenter map')).toBeNull();
  });
});
