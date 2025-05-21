import React, { forwardRef } from 'react';
import { GrimoireSpell } from './types';
import SpellCard from './SpellCard';

interface GrimoireProps {
  spells: GrimoireSpell[];
  onRemoveSpell?: (spellIndex: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  exportError?: string | null;
}

const Grimoire = forwardRef<HTMLDivElement, GrimoireProps>(
  ({ spells, onRemoveSpell, onExport, isExporting, exportError }, ref) => {
    return (
      <div className='grimoire-container' ref={ref}>
        <div className='grimoire-header'>
          <h2>Grimoire</h2>
          {onExport && (
            <button
              onClick={onExport}
              disabled={isExporting || spells.length === 0}
            >
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          )}
        </div>

        {exportError && <div className='error-message'>{exportError}</div>}

        {spells.length === 0 ? (
          <div className='grimoire-empty'>
            Add spells from the list to build your grimoire
          </div>
        ) : (
          spells.map((spell) => (
            <SpellCard
              key={spell.index}
              spell={spell}
              onRemove={
                onRemoveSpell ? () => onRemoveSpell(spell.index) : () => {}
              }
            />
          ))
        )}
      </div>
    );
  }
);

export default Grimoire;
