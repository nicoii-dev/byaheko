/* eslint-env jest */

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return function MockMaterialCommunityIcon({ name, ...props }) {
    return React.createElement(Text, props, name);
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMap = props => React.createElement(View, props);
  MockMap.Marker = props => React.createElement(View, props);
  MockMap.Polyline = props => React.createElement(View, props);
  MockMap.Circle = props => React.createElement(View, props);

  return {
    __esModule: true,
    default: MockMap,
    Marker: MockMap.Marker,
    Polyline: MockMap.Polyline,
    Circle: MockMap.Circle,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(success =>
    success({
      coords: {
        latitude: 8.4542,
        longitude: 124.6319,
        accuracy: 10,
        altitude: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    }),
  ),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  setRNConfiguration: jest.fn(),
  stopObserving: jest.fn(),
}));
