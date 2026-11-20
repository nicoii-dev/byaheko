import commuterDataReducer, {
  loadAdvisories,
  loadAnnouncements,
  loadBoardingPoints,
  loadFares,
} from '../src/redux/slices/commuterDataSlice';
import type {
  ApiAdvisory,
  ApiAnnouncement,
  ApiBoardingPoint,
  ApiFare,
} from '../src/services/api/types';

const fare: ApiFare = {
  id: 'fare_1',
  routeId: 'route_1',
  boardingPointId: 'stop_1',
  transportationTypeId: 'type_1',
  amount: 15,
  currency: 'PHP',
  description: 'Regular jeepney fare',
  isRoundtrip: false,
  isVerified: true,
  sourceName: 'LTFRB',
  sourceUrl: null,
  createdAt: '2025-01-15T08:00:00.000Z',
  updatedAt: '2025-01-15T08:00:00.000Z',
};

const boardingPoint: ApiBoardingPoint = {
  id: 'stop_1',
  routeId: 'route_1',
  name: 'Main Terminal',
  type: 'TERMINAL',
  address: '123 Main Street',
  landmark: 'City Hall',
  latitude: 14.5995,
  longitude: 120.9842,
  sequence: 1,
  isActive: true,
  isVerified: true,
  sourceName: null,
  sourceUrl: null,
  createdAt: '2025-01-15T08:00:00.000Z',
  updatedAt: '2025-01-15T08:00:00.000Z',
};

const announcement: ApiAnnouncement = {
  id: 'announcement_1',
  title: 'Holiday schedule',
  body: 'Buses follow the Sunday schedule on public holidays.',
  authorId: 'user_admin',
  isPublished: true,
  publishedAt: '2025-01-15T08:00:00.000Z',
  createdAt: '2025-01-15T08:00:00.000Z',
  updatedAt: '2025-01-15T08:00:00.000Z',
};

const advisory: ApiAdvisory = {
  id: 'advisory_1',
  routeId: 'route_1',
  severity: 'MODERATE',
  title: 'Bridge repair',
  message: 'Expect delays while the bridge is under repair.',
  isActive: true,
  startsAt: '2025-01-15T08:00:00.000Z',
  endsAt: null,
  createdAt: '2025-01-15T08:00:00.000Z',
  updatedAt: '2025-01-15T08:00:00.000Z',
};

describe('commuterData reducer', () => {
  it('stores every commuter resource from the API', () => {
    let state = commuterDataReducer(undefined, { type: '@@INIT' });

    state = commuterDataReducer(
      state,
      loadFares.fulfilled([fare], 'request_1', undefined),
    );
    state = commuterDataReducer(
      state,
      loadBoardingPoints.fulfilled([boardingPoint], 'request_2', undefined),
    );
    state = commuterDataReducer(
      state,
      loadAnnouncements.fulfilled([announcement], 'request_3', undefined),
    );
    state = commuterDataReducer(
      state,
      loadAdvisories.fulfilled([advisory], 'request_4', undefined),
    );

    expect(state.fares.items).toEqual([fare]);
    expect(state.boardingPoints.items).toEqual([boardingPoint]);
    expect(state.announcements.items).toEqual([announcement]);
    expect(state.advisories.items).toEqual([advisory]);
    expect(state.fares.loading).toBe(false);
  });

  it('keeps a friendly error when a request fails', () => {
    let state = commuterDataReducer(undefined, { type: '@@INIT' });

    state = commuterDataReducer(
      state,
      loadFares.rejected(
        new Error('network'),
        'request_1',
        undefined,
        'Fares offline.',
      ),
    );

    expect(state.fares.error).toBe('Fares offline.');
    expect(state.fares.loading).toBe(false);
    expect(state.fares.items).toEqual([]);
  });
});
