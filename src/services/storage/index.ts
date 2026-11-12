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
  getJson: async <T,>(key: string): Promise<T | null> => {
    const value = await storage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Storage JSON parse failed for key: ${key}`, error);
      return null;
    }
  },
  setJson: async <T,>(key: string, value: T): Promise<void> => {
    await storage.setItem(key, JSON.stringify(value));
  },
};

export default storage;
