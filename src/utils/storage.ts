import { Grimoire, StoredGrimoires, GrimoireSpell } from '../types';
import packageJson from '../../package.json';

const STORAGE_KEY = 'dnd-grimoire-data';
const version = packageJson.version;

// Helper to get a new grimoire ID
export const generateGrimoireId = (): string => {
  return `grimoire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Initialize or get stored grimoires
export const initializeStorage = (): StoredGrimoires => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as StoredGrimoires;
      // Check version and migrate if needed
      if (data.version !== version) {
        // In the future, add migration logic here
        data.version = version;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  // Return default structure if nothing exists or on error
  return {
    version,
    grimoires: [],
  };
};

// Create a new grimoire
export const createGrimoire = (
  name: string,
  characterInfo?: {
    name?: string;
    level?: number;
    class?: string;
  }
): Grimoire => {
  return {
    id: generateGrimoireId(),
    name,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    version,
    characterName: characterInfo?.name,
    characterLevel: characterInfo?.level,
    characterClass: characterInfo?.class,
    spells: [],
  };
};

// Save grimoires to storage
export const saveGrimoires = (data: StoredGrimoires): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save grimoires');
  }
};

// Add or update a grimoire
export const saveGrimoire = (grimoire: Grimoire): StoredGrimoires => {
  const data = initializeStorage();
  const index = data.grimoires.findIndex((g) => g.id === grimoire.id);

  grimoire.lastModified = new Date().toISOString();

  if (index >= 0) {
    data.grimoires[index] = grimoire;
  } else {
    data.grimoires.push(grimoire);
  }

  saveGrimoires(data);
  return data;
};

// Delete a grimoire
export const deleteGrimoire = (id: string): StoredGrimoires => {
  const data = initializeStorage();
  data.grimoires = data.grimoires.filter((g) => g.id !== id);
  if (data.lastActiveGrimoireId === id) {
    delete data.lastActiveGrimoireId;
  }
  saveGrimoires(data);
  return data;
};

// Set the active grimoire
export const setActiveGrimoire = (id: string): void => {
  const data = initializeStorage();
  data.lastActiveGrimoireId = id;
  saveGrimoires(data);
};

// Update grimoire name
export const updateGrimoireName = (
  id: string,
  newName: string
): StoredGrimoires => {
  const data = initializeStorage();
  const grimoire = data.grimoires.find((g) => g.id === id);

  if (grimoire) {
    grimoire.name = newName;
    grimoire.lastModified = new Date().toISOString();
    saveGrimoires(data);
  }

  return data;
};

// Get a grimoire by ID
export const getGrimoire = (id: string): Grimoire | undefined => {
  const data = initializeStorage();
  return data.grimoires.find((g) => g.id === id);
};

// Add a spell to a grimoire
export const addSpellToGrimoire = (
  grimoireId: string,
  spell: GrimoireSpell
): StoredGrimoires => {
  const data = initializeStorage();
  const grimoire = data.grimoires.find((g) => g.id === grimoireId);

  if (!grimoire) {
    throw new Error('Grimoire not found');
  }

  if (!grimoire.spells.some((s) => s.index === spell.index)) {
    grimoire.spells.push(spell);
    grimoire.lastModified = new Date().toISOString();
    saveGrimoires(data);
  }

  return data;
};

// Remove a spell from a grimoire
export const removeSpellFromGrimoire = (
  grimoireId: string,
  spellIndex: string
): StoredGrimoires => {
  const data = initializeStorage();
  const grimoire = data.grimoires.find((g) => g.id === grimoireId);

  if (!grimoire) {
    throw new Error('Grimoire not found');
  }

  grimoire.spells = grimoire.spells.filter((s) => s.index !== spellIndex);
  grimoire.lastModified = new Date().toISOString();
  saveGrimoires(data);

  return data;
};
