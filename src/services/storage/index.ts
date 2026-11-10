import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`Storage getItem failed for key: ${key}`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Storage setItem failed for key: ${key}`, error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Storage removeItem failed for key: ${key}`, error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('Storage clear failed', error);
    }
  },
};

export default storage;