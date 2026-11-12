module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: [
    require.resolve('@react-native/jest-preset/jest/setup.js'),
    '<rootDir>/jest.setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native.*|react-native-.*|@react-navigation|react-redux|@reduxjs|immer|reselect|use-sync-external-store)/)',
  ],
};
