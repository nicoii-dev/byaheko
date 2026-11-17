import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { loadRoutes } from '../../../redux/slices/routesSlice';
import { loadTransportationData } from '../../../redux/slices/transportationSlice';

/**
 * Loads the data required by the transportation directory and exposes a
 * single retry function for its loading and error states.
 */
export const useDirectoryData = () => {
  const dispatch = useAppDispatch();
  const {
    categories,
    boardingPoints,
    loading: transportationLoading,
    error: transportationError,
  } = useAppSelector(state => state.transportation);
  const {
    routes,
    loading: routesLoading,
    error: routesError,
  } = useAppSelector(state => state.routes);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(loadTransportationData());
    }
  }, [categories.length, dispatch]);

  useEffect(() => {
    if (routes.length === 0) {
      dispatch(loadRoutes());
    }
  }, [dispatch, routes.length]);

  const reload = useCallback(() => {
    dispatch(loadTransportationData());
    dispatch(loadRoutes());
  }, [dispatch]);

  return {
    categories,
    boardingPoints,
    routes,
    loading: transportationLoading || routesLoading,
    error: transportationError ?? routesError,
    reload,
  };
};

export default useDirectoryData;
