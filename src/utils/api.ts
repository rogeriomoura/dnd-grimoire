import { Spell, GrimoireSpell } from '../types';
import { CACHE_KEYS, getCachedData, setCachedData } from './cache';

const BASE_API = 'https://www.dnd5eapi.co';

export const fetchSpellList = async (): Promise<Spell[]> => {
  try {
    // Try to get spells from cache first
    const cachedSpells = getCachedData<Spell[]>(CACHE_KEYS.SPELL_LIST);
    if (cachedSpells) {
      return cachedSpells;
    }

    // If not in cache, fetch from API
    const response = await fetch(`${BASE_API}/api/spells`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const spellList: Spell[] = await Promise.all(
      data.results.map(async (spell: any) => {
        const detailResponse = await fetch(`${BASE_API}${spell.url}`);
        if (!detailResponse.ok) {
          throw new Error(`HTTP error! status: ${detailResponse.status}`);
        }
        const detailData = await detailResponse.json();
        return {
          index: spell.index,
          name: spell.name,
          level: detailData.level,
          url: spell.url,
          school: detailData.school,
        };
      })
    );

    // Cache the spell list
    setCachedData(CACHE_KEYS.SPELL_LIST, spellList);
    return spellList;
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

  // If not in cache, fetch from API
  const response = await fetch(`${BASE_API}${spell.url}`);
  const spellDetails: GrimoireSpell = await response.json();

  // Cache the spell details
  setCachedData(cacheKey, spellDetails);
  return spellDetails;
};
