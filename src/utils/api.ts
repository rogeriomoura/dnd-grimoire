import { Spell, GrimoireSpell } from '../types';
import { CACHE_KEYS, getCachedData, setCachedData } from './cache';

const BASE_API = 'https://www.dnd5eapi.co';

// Constants for rate limiting and retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const MAX_CONCURRENT_REQUESTS = 3;

// Track in-progress requests to avoid duplicates
const pendingRequests: Record<string, Promise<any>> = {};

// Sleep helper for retry delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch data with retries, caching, and error handling
export const fetchApiData = async <T>(endpoint: string): Promise<T> => {
  const cacheKey = `${CACHE_KEYS.API_DATA}-${endpoint}`;

  // Check cache first
  const cachedData = getCachedData<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Check if this request is already in progress
  if (endpoint in pendingRequests) {
    return pendingRequests[endpoint] as Promise<T>;
  }

  // Make the request with retries
  const makeRequest = async (): Promise<T> => {
    let retries = 0;

    while (retries <= MAX_RETRIES) {
      try {
        const response = await fetch(`${BASE_API}${endpoint}`);

        if (response.status === 429) {
          // Rate limited - wait and retry
          retries++;

          // If we've hit max retries, throw a specific error
          if (retries > MAX_RETRIES) {
            throw new Error('API rate limit exceeded. Please try again later.');
          }

          // Wait before retrying (with exponential backoff)
          const delay = RETRY_DELAY * Math.pow(2, retries - 1);
          console.log(
            `Rate limited, retrying in ${delay}ms... (${retries}/${MAX_RETRIES})`
          );
          await sleep(delay);
          continue;
        }

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Cache successful response
        setCachedData(cacheKey, data);

        // Clear from pending requests
        delete pendingRequests[endpoint];

        return data;
      } catch (error: any) {
        // If it's not a rate limit error or we've exhausted retries, throw
        if (
          error.message !==
            'API rate limit exceeded. Please try again later.' ||
          retries >= MAX_RETRIES
        ) {
          delete pendingRequests[endpoint];
          throw error;
        }

        retries++;
        const delay = RETRY_DELAY * Math.pow(2, retries - 1);
        await sleep(delay);
      }
    }

    // This should never be reached but TypeScript needs a return
    delete pendingRequests[endpoint];
    throw new Error('Maximum retries reached');
  };

  // Store the promise for this request
  const requestPromise = makeRequest();
  pendingRequests[endpoint] = requestPromise;

  return requestPromise;
};

// Batch fetch multiple API endpoints with controlled concurrency
export const batchFetchApiData = async <T>(
  endpoints: string[],
  concurrency = MAX_CONCURRENT_REQUESTS
): Promise<T[]> => {
  const results: T[] = [];
  const chunks: string[][] = [];

  // Split into chunks based on concurrency
  for (let i = 0; i < endpoints.length; i += concurrency) {
    chunks.push(endpoints.slice(i, i + concurrency));
  }

  // Process chunks sequentially
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((endpoint) =>
        fetchApiData<T>(endpoint).catch((error) => {
          console.error(`Error fetching ${endpoint}:`, error);
          return null as unknown as T; // Return null for failed fetches
        })
      )
    );

    results.push(...chunkResults.filter(Boolean)); // Filter out nulls from failed fetches

    // Small delay between chunks to avoid overwhelming the API
    if (chunks.length > 1) await sleep(500);
  }

  return results;
};

export const fetchSpellList = async (): Promise<Spell[]> => {
  try {
    // Try to get spells from cache first
    const cachedSpells = getCachedData<Spell[]>(CACHE_KEYS.SPELL_LIST);
    if (cachedSpells) {
      return cachedSpells;
    }

    // Fetch the spell index
    const data = await fetchApiData<{
      results: { index: string; name: string; url: string }[];
    }>('/api/spells');

    // Batch the detail requests with controlled concurrency
    const spellDataEndpoints: string[] = [];
    const minimalSpellList: Spell[] = data.results.map((spell) => {
      spellDataEndpoints.push(spell.url);
      // Return a minimal spell object to start with
      return {
        index: spell.index,
        name: spell.name,
        level: -1, // We'll fill this in with the batch request
        url: spell.url,
      };
    });

    // Start a separate async process to fetch full spell details
    // This allows us to return the basic spell list immediately for better UX
    const fetchFullDetails = async () => {
      try {
        // Batch fetch full spell details with controlled concurrency
        const spellDetails = await batchFetchApiData<any>(
          spellDataEndpoints,
          MAX_CONCURRENT_REQUESTS
        );

        // Create a complete spell list
        const fullSpellList = minimalSpellList.map((spell) => {
          const details =
            spellDetails.find((d) => d && d.index === spell.index) || {};
          return {
            ...spell,
            level: details.level ?? -1,
            school: details.school,
          };
        });

        // Cache the full spell list
        if (fullSpellList.length > 0) {
          setCachedData(CACHE_KEYS.SPELL_LIST, fullSpellList);
        }
      } catch (error) {
        console.error('Error fetching full spell details:', error);
      }
    };

    // Start background fetching of details
    fetchFullDetails();

    // Return the minimal spell list immediately
    return minimalSpellList;
  } catch (error) {
    console.error('Error fetching spell list:', error);
    throw error;
  }
};

export const fetchSpellDetails = async (
  spell: Spell
): Promise<GrimoireSpell> => {
  // Try to get spell details from cache first
  const cacheKey = `${CACHE_KEYS.SPELL_DETAILS}-${spell.index}`;
  const cachedSpellDetails = getCachedData<GrimoireSpell>(cacheKey);

  if (cachedSpellDetails) {
    return cachedSpellDetails;
  }

  // If not in cache, fetch from API with retry logic
  const spellDetails = await fetchApiData<GrimoireSpell>(spell.url);

  // Cache the spell details
  setCachedData(cacheKey, spellDetails);
  return spellDetails;
};
