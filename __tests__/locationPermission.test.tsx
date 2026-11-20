import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '../src/config/theme';
import { STORAGE_KEYS } from '../src/config/constants';
import { store } from '../src/redux/store';
import type { RootStackParamList } from '../src/navigation/types';
import LocationPermissionScreen from '../src/features/onboarding/screens/LocationPermissionScreen';

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LocationPermission'
>;

describe('LocationPermissionScreen', () => {
  const reset = jest.fn();

  const renderScreen = async () =>
    render(
      <ReduxProvider store={store}>
        <PaperProvider theme={lightTheme}>
          <LocationPermissionScreen
            {...({
              navigation: { reset },
              route: {
                key: 'LocationPermission',
                name: 'LocationPermission',
                params: { returnTo: 'Login' },
              },
            } as unknown as ScreenProps)}
          />
        </PaperProvider>
      </ReduxProvider>,
    );

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (Geolocation.requestAuthorization as jest.Mock).mockImplementation(
      (onSuccess: () => void) => onSuccess(),
    );
  });

  it('skips the device permission when the user declines', async () => {
    const { getByText } = await renderScreen();

    await fireEvent.press(getByText('Not now'));

    await waitFor(() =>
      expect(reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
    expect(
      await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PROMPT_SEEN),
    ).toBe('true');
    expect(
      await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_ACCESS_ALLOWED),
    ).toBe('false');
    expect(Geolocation.requestAuthorization).not.toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('requests the device permission when the user allows location', async () => {
    const { getByText } = await renderScreen();

    await act(async () => {
      await fireEvent.press(getByText('Allow location'));
    });

    await waitFor(() =>
      expect(reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
    expect(Geolocation.requestAuthorization).toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
    expect(
      await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PROMPT_SEEN),
    ).toBe('true');
    expect(
      await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_ACCESS_ALLOWED),
    ).toBe('true');
    expect(store.getState().location.accessAllowed).toBe(true);
  });
});
