import { Spell, GrimoireSpell } from '../types';
import { CACHE_KEYS, getCachedData, setCachedData } from './cache';

const BASE_API = 'https://www.dnd5eapi.co';

export const fetchSpellList = async (): Promise<Spell[]> => {
  // Try to get spells from cache first
  const cachedSpells = getCachedData<Spell[]>(CACHE_KEYS.SPELL_LIST);
  if (cachedSpells) {
    return cachedSpells;
  }

  // If not in cache, fetch from API
  const response = await fetch(`${BASE_API}/api/spells`);
  const data = await response.json();
  const spellList: Spell[] = data.results.map((spell: any) => ({
    index: spell.index,
    name: spell.name,
    level: spell.level,
    url: spell.url,
  }));

  // Cache the spell list
  setCachedData(CACHE_KEYS.SPELL_LIST, spellList);
  return spellList;
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
