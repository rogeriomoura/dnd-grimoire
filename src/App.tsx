import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SpellList from './SpellList';
import Grimoire from './Grimoire';
import {
  Spell,
  GrimoireSpell,
  StoredGrimoires,
  Grimoire as GrimoireType,
} from './types';
import {
  // Storage utils
  initializeStorage,
  createGrimoire,
  saveGrimoire,
  deleteGrimoire,
  setActiveGrimoire as setActiveGrimoireStorage,
  addSpellToGrimoire,
  removeSpellFromGrimoire,
  // API utils
  fetchSpellList,
  fetchSpellDetails,
  // PDF utils
  createGrimoirePDF,
} from './utils';

import packageJson from '../package.json';
const version = packageJson.version;

function App() {
  // State management
  const [spells, setSpells] = useState<Spell[]>([]);
  const [storedGrimoires, setStoredGrimoires] = useState<StoredGrimoires>({
    version: '',
    grimoires: [],
  });
  const [activeGrimoire, setActiveGrimoire] = useState<GrimoireType | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const grimoireRef = useRef<HTMLDivElement>(null);

  // Utility functions
  const showFeedback = (
    message: string,
    type: 'success' | 'error' | 'info'
  ) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const updateActiveGrimoire = (
    grimoires: StoredGrimoires,
    grimoireId: string
  ) => {
    setActiveGrimoire(
      grimoires.grimoires.find((g) => g.id === grimoireId) || null
    );
  };

  // Initialization effects
  useEffect(() => {
    const loadSpells = async () => {
      try {
        const spellList = await fetchSpellList();
        setSpells(spellList);
      } catch (error) {
        console.error('Error loading spells:', error);
        showFeedback('Failed to load spells. Please try again later.', 'error');
      }
    };

    loadSpells();
  }, []);

  useEffect(() => {
    const data = initializeStorage();
    setStoredGrimoires(data);

    // Set active grimoire if there's a last active one or create a default
    if (data.lastActiveGrimoireId) {
      const active = data.grimoires.find(
        (g) => g.id === data.lastActiveGrimoireId
      );
      if (active) {
        setActiveGrimoire(active);
      }
    } else if (data.grimoires.length > 0) {
      setActiveGrimoire(data.grimoires[0]);
    } else {
      // Create a default grimoire if none exists
      const defaultGrimoire = createGrimoire('My First Grimoire');
      const updatedData = saveGrimoire(defaultGrimoire);
      setStoredGrimoires(updatedData);
      setActiveGrimoire(defaultGrimoire);
    }
  }, []);

  // Event handlers
  const handleCreateGrimoire = (
    name: string,
    characterInfo?: { name?: string; level?: number; class?: string }
  ) => {
    const newGrimoire = createGrimoire(name, characterInfo);
    const updatedData = saveGrimoire(newGrimoire);
    setStoredGrimoires(updatedData);
    setActiveGrimoire(newGrimoire);
    showFeedback(`Created new grimoire: ${name}`, 'success');
  };

  const handleSelectGrimoire = (id: string) => {
    const grimoire = storedGrimoires.grimoires.find((g) => g.id === id);
    if (grimoire) {
      setActiveGrimoire(grimoire);
      setActiveGrimoireStorage(id);
      showFeedback(`Switched to grimoire: ${grimoire.name}`, 'success');
    }
  };

  const handleDeleteGrimoire = (id: string) => {
    const grimoire = storedGrimoires.grimoires.find((g) => g.id === id);
    if (!grimoire) return;

    if (window.confirm(`Are you sure you want to delete "${grimoire.name}"?`)) {
      const updatedData = deleteGrimoire(id);
      setStoredGrimoires(updatedData);
      if (activeGrimoire?.id === id) {
        setActiveGrimoire(updatedData.grimoires[0] || null);
      }
      showFeedback(`Deleted grimoire: ${grimoire.name}`, 'success');
    }
  };

  const handleSpellSelect = async (spell: Spell) => {
    if (!activeGrimoire) {
      showFeedback('Please create or select a grimoire first', 'error');
      return;
    }

    // Don't add duplicate spells
    if (activeGrimoire.spells.some((s) => s.index === spell.index)) {
      showFeedback(`${spell.name} is already in your grimoire`, 'info');
      return;
    }

    try {
      const spellDetails = await fetchSpellDetails(spell);
      const updatedData = addSpellToGrimoire(activeGrimoire.id, spellDetails);
      setStoredGrimoires(updatedData);
      updateActiveGrimoire(updatedData, activeGrimoire.id);
      showFeedback(`Added ${spell.name} to your grimoire`, 'success');
    } catch (error) {
      console.error('Error adding spell:', error);
      showFeedback(`Failed to add ${spell.name}`, 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!activeGrimoire?.spells.length) return;

    setIsExporting(true);
    setExportError(null);

    try {
      await createGrimoirePDF(activeGrimoire.spells);
      showFeedback('Grimoire exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRemoveSpell = (spellIndex: string) => {
    if (!activeGrimoire) return;

    const updatedData = removeSpellFromGrimoire(activeGrimoire.id, spellIndex);
    setStoredGrimoires(updatedData);
    updateActiveGrimoire(updatedData, activeGrimoire.id);
  };

  // Render
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>D&D 5e Grimoire Builder</h1>
        <div className='grimoire-controls'>
          <select
            value={activeGrimoire?.id || ''}
            onChange={(e) => handleSelectGrimoire(e.target.value)}
          >
            {storedGrimoires.grimoires.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button onClick={() => handleCreateGrimoire('New Grimoire')}>
            New Grimoire
          </button>
          {activeGrimoire && (
            <button onClick={() => handleDeleteGrimoire(activeGrimoire.id)}>
              Delete Grimoire
            </button>
          )}
        </div>
      </header>

      <main>
        <SpellList spells={spells} onSpellSelect={handleSpellSelect} />
        {activeGrimoire && (
          <Grimoire
            ref={grimoireRef}
            spells={activeGrimoire.spells}
            onRemoveSpell={handleRemoveSpell}
            onExport={handleExportPDF}
            isExporting={isExporting}
            exportError={exportError}
          />
        )}
      </main>

      {feedback && (
        <div className={`feedback feedback-${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      <div className='version-display'>v{version}</div>
    </div>
  );
}

export default App;
