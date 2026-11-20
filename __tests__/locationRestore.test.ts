import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { configureStore } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../src/config/constants';
import locationReducer, {
  restoreLocationAccess,
} from '../src/redux/slices/locationSlice';

const makeStore = () => configureStore({ reducer: { location: locationReducer } });

describe('restoreLocationAccess', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(success =>
      success({
        coords: { latitude: 8.4542, longitude: 124.6319 },
        timestamp: Date.now(),
      }),
    );
  });

  it('stays dormant when the user never approved location', async () => {
    const store = makeStore();

    await store.dispatch(restoreLocationAccess());

    expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(store.getState().location.currentLocation).toBeNull();
    expect(store.getState().location.accessAllowed).toBe(false);
    expect(store.getState().location.restoring).toBe(false);
  });

  it('silently restores the fix after a first-run approval', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_ACCESS_ALLOWED, 'true');
    const store = makeStore();

    await store.dispatch(restoreLocationAccess());

    expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
    // Re-approval must not trigger the OS permission dialog a second time.
    expect(Geolocation.requestAuthorization).not.toHaveBeenCalled();
    const state = store.getState().location;
    expect(state.accessAllowed).toBe(true);
    expect(state.permissionStatus).toBe('granted');
    expect(state.currentLocation?.latitude).toBe(8.4542);
    expect(state.restoring).toBe(false);
    expect(state.error).toBeNull();
  });
});
