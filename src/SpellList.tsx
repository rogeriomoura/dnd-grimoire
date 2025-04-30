import React, { useState } from 'react';
import { Spell } from './types';

interface SpellListProps {
  spells: Spell[];
  onSpellSelect: (spell: Spell) => void;
}

const SpellList: React.FC<SpellListProps> = ({ spells, onSpellSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSpells = spells.filter((spell) =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='spell-list-container'>
      <h2>Spell List</h2>
      <input
        type='text'
        placeholder='Search for spells...'
        className='search-input'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredSpells.length === 0 ? (
        <div className='spell-item'>No spells found</div>
      ) : (
        filteredSpells.map((spell) => (
          <div
            key={spell.name}
            className='spell-item'
            onClick={() => onSpellSelect(spell)}
          >
            {spell.name}
          </div>
        ))
      )}
    </div>
  );
};

export default SpellList;
