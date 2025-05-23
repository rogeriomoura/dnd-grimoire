import React, { useState, useMemo } from 'react';
import { Spell } from '../types';

interface SpellListProps {
  spells: Spell[];
  onSpellSelect: (spell: Spell) => void;
  isLoading?: boolean;
}

interface Filters {
  search: string;
  level: string;
  school: string;
}

const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SPELL_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const SpellList: React.FC<SpellListProps> = ({
  spells,
  onSpellSelect,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    level: '',
    school: '',
  });

  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      const matchesSearch = spell.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesLevel =
        !filters.level || spell.level === parseInt(filters.level);

      const spellSchoolName = spell.school?.name?.toLowerCase();
      const matchesSchool =
        !filters.school || spellSchoolName === filters.school.toLowerCase();

      return matchesSearch && matchesLevel && matchesSchool;
    });
  }, [spells, filters]);

  const handleFilterChange =
    (key: keyof Filters) =>
    (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  return (
    <div className='spell-browser'>
      <div className='spell-browser-header'>
        <h2>Spell List</h2>
        <div className='spell-count'>
          {filteredSpells.length} of {spells.length} spells
        </div>
      </div>

      <div className='spell-filters-container'>
        <div className='search-input-container'>
          <span className='search-icon'>🔍</span>
          <input
            type='text'
            placeholder='Search for spells...'
            className='input-modern search-input'
            value={filters.search}
            onChange={handleFilterChange('search')}
          />
          {filters.search && (
            <button
              className='clear-search-btn'
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              aria-label='Clear search'
            >
              ×
            </button>
          )}
        </div>

        <div className='filter-section'>
          <div className='filter-header'>
            <span>Filter by</span>
            {(filters.level || filters.school) && (
              <button
                className='clear-filters-btn'
                onClick={() =>
                  setFilters((prev) => ({ ...prev, level: '', school: '' }))
                }
              >
                Reset
              </button>
            )}
          </div>
          <div className='filter-controls'>
            <div className='filter-group'>
              <label>Level</label>
              <select
                className='select-modern'
                value={filters.level}
                onChange={handleFilterChange('level')}
              >
                <option value=''>All Levels</option>
                {SPELL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level === '0' ? 'Cantrip' : `Level ${level}`}
                  </option>
                ))}
              </select>
            </div>

            <div className='filter-group'>
              <label>School</label>
              <select
                className='select-modern'
                value={filters.school}
                onChange={handleFilterChange('school')}
              >
                <option value=''>All Schools</option>
                {SPELL_SCHOOLS.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className='spell-list-content'>
        {isLoading ? (
          <div className='loading-state'>
            <div className='loading-spinner'></div>
            <p>Loading spells...</p>
            {spells.length > 0 && (
              <small className='rate-limit-warning'>
                Loading complete spell details... ({spells.length} spells found
                so far)
              </small>
            )}
          </div>
        ) : filteredSpells.length === 0 ? (
          <div className='empty-state'>
            <p>No spells found</p>
            <small>Try adjusting your search filters</small>
          </div>
        ) : (
          <div className='spell-list'>
            {filteredSpells.map((spell) => (
              <button
                key={spell.index}
                className='spell-list-item'
                onClick={() => onSpellSelect(spell)}
              >
                <div className='spell-item-header'>
                  <span className='spell-item-name'>{spell.name}</span>
                  <span className='spell-item-level'>
                    {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                  </span>
                </div>
                <div className='spell-item-meta'>
                  {spell.school && (
                    <span className='spell-item-school'>
                      {spell.school.name}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { SpellList };
