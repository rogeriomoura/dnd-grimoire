import React from 'react';
import { GrimoireSpell } from './types';
import SpellCard from './SpellCard';

interface GrimoireProps {
  grimoire: GrimoireSpell[];
}

const Grimoire: React.FC<GrimoireProps> = ({ grimoire }) => {
  return (
    <div className='grimoire-container'>
      <h2>Grimoire</h2>
      {grimoire.length === 0 ? (
        <div className='grimoire-empty'>
          Add spells from the list to build your grimoire
        </div>
      ) : (
        grimoire.map((spell) => <SpellCard key={spell.index} spell={spell} />)
      )}
    </div>
  );
};

export default Grimoire;
