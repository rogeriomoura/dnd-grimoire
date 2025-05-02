import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SpellList from './SpellList';
import Grimoire from './Grimoire';
import { Spell, GrimoireSpell } from './types';
import { createGrimoirePDF } from './utils';

const BASE_API = 'https://www.dnd5eapi.co/api';
const STORAGE_KEY = 'dnd-grimoire-spells';

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [grimoire, setGrimoire] = useState<GrimoireSpell[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const grimoireRef = useRef<HTMLDivElement>(null);

  // Load spells from the API
  useEffect(() => {
    async function loadSpells() {
      try {
        const response = await fetch(`${BASE_API}/spells`);
        const data = await response.json();
        const spellList: Spell[] = data.results.map((spell: any) => ({
          index: spell.index,
          name: spell.name,
          level: spell.level,
          url: spell.url,
        }));
        setSpells(spellList);
      } catch (error) {
        console.error('Error loading spells:', error);
      }
    }

    loadSpells();
  }, []);

  // Load saved grimoire from localStorage
  useEffect(() => {
    const savedGrimoire = localStorage.getItem(STORAGE_KEY);
    if (savedGrimoire) {
      try {
        const parsedGrimoire = JSON.parse(savedGrimoire);
        setGrimoire(parsedGrimoire);
      } catch (error) {
        console.error('Error loading saved grimoire:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save grimoire to localStorage whenever it changes
  useEffect(() => {
    if (grimoire.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(grimoire));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [grimoire]);

  const handleSpellSelect = async (spell: Spell) => {
    // Don't add duplicate spells
    if (grimoire.some((s) => s.index === spell.index)) {
      setFeedback({
        message: `${spell.name} is already in your grimoire`,
        type: 'info',
      });
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    try {
      const response = await fetch(`${BASE_API}/spells/${spell.index}`);
      const spellDetails: GrimoireSpell = await response.json();
      setGrimoire([...grimoire, spellDetails]);
      setFeedback({
        message: `Added ${spell.name} to your grimoire`,
        type: 'success',
      });
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Error loading spell details:', error);
      setFeedback({
        message: 'Failed to add spell. Please try again.',
        type: 'error',
      });
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleRemoveSpell = (spellIndex: string) => {
    setGrimoire(grimoire.filter((spell) => spell.index !== spellIndex));
  };

  const exportToPDF = async () => {
    if (!grimoireRef.current || grimoire.length === 0) return;

    setIsExporting(true);
    setExportError(null);

    try {
      await createGrimoirePDF(grimoire);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='App'>
      <h1>D&D 5e Grimoire Builder</h1>
      {feedback && (
        <div className={`feedback feedback-${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      <div className='container'>
        <SpellList spells={spells} onSpellSelect={handleSpellSelect} />
        <div ref={grimoireRef}>
          <Grimoire grimoire={grimoire} onRemoveSpell={handleRemoveSpell} />
        </div>
      </div>
      <div className='export-container'>
        <button
          className='export-button'
          onClick={exportToPDF}
          disabled={isExporting || grimoire.length === 0}
        >
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
        {exportError && <div className='export-error'>{exportError}</div>}
      </div>
    </div>
  );
}

export default App;
