import { MockAuthApi } from '../src/services/mock/authApi';
import { MockRoutesApi } from '../src/services/mock/routesApi';
import { MockTransportationApi } from '../src/services/mock/transportationApi';
import { demoRoutes } from '../src/services/mock/data';

describe('mock auth service', () => {
  it('signs in with the documented demo account', async () => {
    const api = new MockAuthApi();

    await expect(
      api.login({
        email: 'juan@example.com',
        password: 'Password123!',
      }),
    ).resolves.toMatchObject({
      token: expect.stringContaining('mock_token_'),
      user: { email: 'juan@example.com', isEmailVerified: true },
    });
  });

  it('rejects incorrect credentials', async () => {
    const api = new MockAuthApi();

    await expect(
      api.login({
        email: 'juan@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow('Invalid email or password.');
  });

  it('registers an unverified account and verifies it with the demo code', async () => {
    const api = new MockAuthApi();

    await expect(
      api.register({
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria@example.com',
        mobileNumber: '09181234567',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    ).resolves.toMatchObject({
      user: { email: 'maria@example.com', isEmailVerified: false },
    });

    await expect(
      api.verifyEmail('maria@example.com', '123456'),
    ).resolves.toMatchObject({
      user: { email: 'maria@example.com', isEmailVerified: true },
    });
  });
});

describe('mock transportation service', () => {
  it('returns the demonstration boarding points', async () => {
    const api = new MockTransportationApi();

    await expect(api.getBoardingPoints()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
      ]),
    );
  });

  it('returns boarding points sorted by distance when nearby', async () => {
    const api = new MockTransportationApi();

    await expect(
      api.getNearbyBoardingPoints({
        latitude: 8.4542,
        longitude: 124.6319,
      }),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ distanceMeters: expect.any(Number) }),
      ]),
    );
  });
});

describe('mock routes service', () => {
  it('looks up a route by id and returns null for an unknown route', async () => {
    const api = new MockRoutesApi();

    await expect(api.getRouteDetails(demoRoutes[0].id)).resolves.toEqual(
      demoRoutes[0],
    );
    await expect(api.getRouteDetails('missing_route')).resolves.toBeNull();
  });

  it('plans a demonstration trip between two stops on the same route', async () => {
    const api = new MockRoutesApi();
    const route = demoRoutes[0];
    const origin = route.stops[0];
    const destination = route.stops[route.stops.length - 1];

    await expect(api.planTrip(origin, destination)).resolves.toMatchObject({
      isDemoData: true,
      routeOptions: expect.arrayContaining([
        expect.objectContaining({
          routeIds: expect.arrayContaining([route.id]),
        }),
      ]),
    });
  });
});
