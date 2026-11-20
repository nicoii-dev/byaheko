import axios from 'axios';
import type { Location } from '../../types';
import { environment } from '../../config/environment';
import { logApiError, logApiRequest, logApiResponse } from './log';

interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
  osm_id?: number;
  osm_type?: string;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProperties;
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

const isCoordinate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * Maps a Photon/GeoJSON feature to the app's Location model. Photon is an
 * OpenStreetMap-based geocoder; `BYAHEKO_GEOCODER_URL` can point at a hosted,
 * production-grade provider with the same response shape.
 */
export const mapPhotonFeature = (
  feature: PhotonFeature,
  index: number,
): Location | null => {
  const coordinates = feature.geometry?.coordinates;
  if (
    !Array.isArray(coordinates) ||
    !isCoordinate(coordinates[0]) ||
    !isCoordinate(coordinates[1])
  ) {
    return null;
  }

  const props = feature.properties ?? {};
  const street = [props.housenumber, props.street].filter(Boolean).join(' ');
  const city = props.city ?? props.town ?? props.village ?? props.district;
  const address = [street, city, props.state, props.country]
    .filter(Boolean)
    .join(', ');
  const name = props.name ?? street ?? city ?? address ?? 'Selected place';

  return {
    id: props.osm_id
      ? `${props.osm_type ?? 'osm'}-${props.osm_id}`
      : `geocode-${index}-${coordinates[0]}-${coordinates[1]}`,
    name,
    address: address || undefined,
    longitude: coordinates[0],
    latitude: coordinates[1],
  };
};

export const searchGeocoder = async (query: string): Promise<Location[]> => {
  const params = { q: query, limit: 8 };
  const startedAt = Date.now();
  logApiRequest({
    method: 'get',
    url: environment.geocoderUrl,
    params,
  });

  try {
    const response = await axios.get<PhotonResponse>(environment.geocoderUrl, {
      params,
      timeout: environment.requestTimeoutMs,
      headers: { Accept: 'application/json' },
    });

    logApiResponse({
      method: 'get',
      url: environment.geocoderUrl,
      params,
      status: response.status,
      durationMs: Date.now() - startedAt,
      data: response.data,
    });

    return (response.data?.features ?? [])
      .map(mapPhotonFeature)
      .filter((location): location is Location => location !== null);
  } catch (error) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
      code?: string;
      message?: string;
    };
    logApiError({
      method: 'get',
      url: environment.geocoderUrl,
      params,
      status: axiosError.response?.status,
      code: axiosError.code,
      message: axiosError.message,
      durationMs: Date.now() - startedAt,
      data: axiosError.response?.data,
    });
    throw error;
  }
};
