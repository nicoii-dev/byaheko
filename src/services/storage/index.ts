import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`Storage getItem failed for key: ${key}`, error);
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      return AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Storage setItem failed for key: ${key}`, error);
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      return AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Storage removeItem failed for key: ${key}`, error);
      return Promise.resolve();
    }
  },
  clear: (): Promise<void> => {
    try {
      return AsyncStorage.clear();
    } catch (error) {
      console.warn('Storage clear failed', error);
      return Promise.resolve();
    }
  },
};

export default storage;