import React, { forwardRef } from 'react';
import { GrimoireSpell } from '../types';
import { SpellCard } from './SpellCard';

interface GrimoireProps {
  name: string;
  spells: GrimoireSpell[];
  onRemoveSpell?: (spellIndex: string) => void;
  onRename?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
  exportError?: string | null;
}

const Grimoire = forwardRef<HTMLDivElement, GrimoireProps>(
  (
    {
      name,
      spells,
      onRemoveSpell,
      onRename,
      onExport,
      isExporting,
      exportError,
    },
    ref
  ) => {
    return (
      <div className='grimoire-container' ref={ref}>
        <div className='grimoire-header'>
          <div className='grimoire-title'>
            <h2>{name || 'My Grimoire'}</h2>
            {onRename && (
              <button
                className='btn-icon'
                onClick={onRename}
                title='Rename grimoire'
              >
                ✏️
              </button>
            )}
          </div>
          <div className='grimoire-actions'>
            {onExport && (
              <button
                className='btn btn-secondary'
                onClick={onExport}
                disabled={isExporting || spells.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            )}
          </div>
        </div>

        {exportError && (
          <div className='toast toast-error'>
            <span>{exportError}</span>
          </div>
        )}

        <div className='grimoire-content'>
          {spells.length === 0 ? (
            <div className='grimoire-empty'>
              <div className='empty-grimoire-icon'>📜</div>
              <h3>Your grimoire is empty</h3>
              <p>Add spells from the list to build your personal collection</p>
            </div>
          ) : (
            <div className='grimoire-spells'>
              {spells.map((spell) => (
                <SpellCard
                  key={spell.index}
                  spell={spell}
                  onRemove={
                    onRemoveSpell ? () => onRemoveSpell(spell.index) : () => {}
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export { Grimoire };
