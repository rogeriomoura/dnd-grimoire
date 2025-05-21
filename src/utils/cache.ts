// Cache keys for different types of data
export const CACHE_KEYS = {
  SPELL_LIST: 'spell-list',
  SPELL_DETAILS: 'spell-details',
} as const;

// Get data from cache
export const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error(`Error reading from cache for key ${key}:`, error);
  }
  return null;
};

// Save data to cache
export const setCachedData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to cache for key ${key}:`, error);
  }
};

// Clear specific cache entries
export const clearCache = (key?: string): void => {
  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Clear all cached spell data
      Object.values(CACHE_KEYS).forEach((cacheKey) => {
        localStorage.removeItem(cacheKey);
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
