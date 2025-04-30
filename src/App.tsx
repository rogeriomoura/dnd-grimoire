import React, { useState, useEffect } from 'react';
import './App.css';
import SpellList from './SpellList';
import Grimoire from './Grimoire';
import { Spell, GrimoireSpell } from './types';

const BASE_API = 'https://www.dnd5eapi.co/api';

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [grimoire, setGrimoire] = useState<GrimoireSpell[]>([]);

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

  const handleSpellSelect = async (spell: Spell) => {
    try {
      const response = await fetch(`${BASE_API}/spells/${spell.index}`);
      const spellDetails: GrimoireSpell = await response.json();
      setGrimoire([...grimoire, spellDetails]);
    } catch (error) {
      console.error('Error loading spell details:', error);
    }
  };

  return (
    <div className='App'>
      <h1>D&D 5e Grimoire Builder</h1>
      <div className='container'>
        <SpellList spells={spells} onSpellSelect={handleSpellSelect} />
        <Grimoire grimoire={grimoire} />
      </div>
      <button className='print-button' onClick={() => window.print()}>
        Print Grimoire
      </button>
    </div>
  );
}

export default App;
