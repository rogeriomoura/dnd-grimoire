// Cache keys for different types of data
export const CACHE_KEYS = {
  SPELL_LIST: 'spell-list',
  SPELL_DETAILS: 'spell-details',
  API_DATA: 'api-data',
} as const;

// Cache expiration time (24 hours in milliseconds)
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Cache item interface with timestamp for expiration
export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Get data from cache with expiration check
export const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cachedItem: CacheItem<T> = JSON.parse(cached);
    const now = new Date().getTime();

    // Check if cache is expired
    if (now - cachedItem.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }

    return cachedItem.data;
  } catch (error) {
    console.error(`Error reading from cache for key ${key}:`, error);
    // If there's an error with the cache, clear it to prevent future issues
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore nested errors
    }
  }
  return null;
};

// Save data to cache with timestamp
export const setCachedData = <T>(key: string, data: T): void => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
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
