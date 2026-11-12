import authReducer, {
  login,
  logout,
  restoreSession,
} from '../src/redux/slices/authSlice';
import favoritesReducer, {
  addFavorite,
  removeFavorite,
} from '../src/redux/slices/favoritesSlice';
import themeReducer, {
  loadThemeMode,
  setThemeMode,
} from '../src/redux/slices/themeSlice';
import type { Favorite, User } from '../src/types';

const user: User = {
  id: 'user_test',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan@example.com',
  mobileNumber: '09171234567',
  isEmailVerified: true,
  createdAt: '2025-01-15T08:00:00.000Z',
};

describe('auth reducer', () => {
  it('stores the signed-in user and clears it on logout', () => {
    let state = authReducer(undefined, { type: '@@INIT' });

    state = authReducer(
      state,
      login.fulfilled(
        { user, token: 'token_1' },
        'request_1',
        { email: user.email, password: 'Password123!' },
      ),
    );

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token_1');
    expect(state.pendingVerificationEmail).toBeNull();

    state = authReducer(state, logout.fulfilled(undefined, 'request_2', undefined));

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('marks the session as initialized when restore finds nothing', () => {
    const state = authReducer(
      undefined,
      restoreSession.fulfilled(null, 'request_1', undefined),
    );

    expect(state.isInitialized).toBe(true);
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('remembers the email of an unverified account', () => {
    const unverifiedUser = { ...user, isEmailVerified: false };

    const state = authReducer(
      undefined,
      login.fulfilled(
        { user: unverifiedUser, token: 'token_1' },
        'request_1',
        { email: user.email, password: 'Password123!' },
      ),
    );

    expect(state.pendingVerificationEmail).toBe(unverifiedUser.email);
  });
});

describe('favorites reducer', () => {
  const favorite: Favorite = {
    id: 'fav_1',
    type: 'route',
    name: 'Route A',
    data: {
      id: 'route_a',
      routeCode: 'A',
      routeName: 'Route A',
      origin: 'Origin',
      destination: 'Destination',
      transportationType: 'jeepney',
      stops: [],
      fare: 15,
      estimatedDuration: 20,
      status: 'active',
    },
    createdAt: '2025-01-15T08:00:00.000Z',
  };

  it('adds and removes a favorite', () => {
    let state = favoritesReducer(undefined, { type: '@@INIT' });

    state = favoritesReducer(
      state,
      addFavorite.fulfilled([favorite], 'request_1', {
        type: favorite.type,
        name: favorite.name,
        data: favorite.data,
      }),
    );

    expect(state.items).toEqual([favorite]);
    expect(state.loading).toBe(false);

    state = favoritesReducer(
      state,
      removeFavorite.fulfilled([], 'request_2', favorite.id),
    );

    expect(state.items).toEqual([]);
  });
});

describe('theme reducer', () => {
  it('loads and stores the selected mode', () => {
    let state = themeReducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('light');

    state = themeReducer(
      state,
      loadThemeMode.fulfilled('dark', 'request_1', undefined),
    );
    expect(state.mode).toBe('dark');

    state = themeReducer(
      state,
      setThemeMode.fulfilled('light', 'request_2', 'light'),
    );
    expect(state.mode).toBe('light');
  });
});
