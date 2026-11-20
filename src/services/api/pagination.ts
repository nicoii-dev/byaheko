import type { AxiosResponse } from 'axios';
import api from './client';
import { asList } from '../../utils/apiData';
import type { ListParams, PaginationMeta } from './types';

/** Axios responses carry the envelope's `meta` after the interceptor unwraps. */
export type PagedResponse<T> = AxiosResponse<T[]> & {
  meta?: PaginationMeta | null;
};

const MAX_PAGES = 50;

/**
 * Fetches every page of a paginated endpoint.
 *
 * The API returns `{ data: items, meta }`; the response interceptor unwraps the
 * items onto `response.data` and keeps `meta` on the response. We walk pages
 * until `hasNextPage` is false so screens can show the complete dataset.
 */
export async function fetchAllPages<T>(
  path: string,
  params: ListParams = {},
): Promise<T[]> {
  const limit = params.limit ?? 100;
  let page = params.page ?? 1;
  const items: T[] = [];

  for (let fetched = 0; fetched < MAX_PAGES; fetched += 1) {
    const response = await api.get<T[]>(path, {
      params: { ...params, page, limit },
    });

    items.push(...asList(response.data));

    const meta = (response as PagedResponse<T>).meta;
    if (!meta?.hasNextPage) {
      break;
    }
    page = (meta.page ?? page) + 1;
  }

  return items;
}
