import axios from 'axios';
import { environment } from '../config/environment';

const api = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error;
      return Promise.reject(new Error(message || 'Something went wrong.'));
    }
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    return Promise.reject(error);
  }
);

export default api;