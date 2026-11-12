import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { darkTheme, lightTheme } from './config/theme';
import { useAppSelector } from './redux/hooks';
import AppNavigator from './navigation/AppNavigator';

const ThemedApp = () => {
  const mode = useAppSelector(state => state.theme.mode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <ThemedApp />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  </Provider>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
