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

jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMap = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getCenter: jest.fn(),
      getZoom: jest.fn(),
      getBounds: jest.fn(),
      queryRenderedFeatures: jest.fn(),
    }));
    return React.createElement(View, props, props.children);
  });

  const MockCamera = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      fitBounds: jest.fn(),
      flyTo: jest.fn(),
      easeTo: jest.fn(),
      jumpTo: jest.fn(),
    }));
    return React.createElement(View, props);
  });

  const MockSource = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      setFeatureState: jest.fn(),
      getFeatureState: jest.fn(),
    }));
    return React.createElement(View, props, props.children);
  });

  const MockMarker = props => React.createElement(View, props, props.children);

  return {
    __esModule: true,
    Map: MockMap,
    Camera: MockCamera,
    GeoJSONSource: MockSource,
    Layer: props => React.createElement(View, props),
    Marker: MockMarker,
    UserLocation: props => React.createElement(View, props),
  };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockWebView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      injectJavaScript: jest.fn(),
      reload: jest.fn(),
    }));

    return React.createElement(View, props);
  });

  return {
    __esModule: true,
    WebView: MockWebView,
    default: MockWebView,
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
