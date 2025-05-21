import React, { useState, useMemo } from 'react';
import { Spell } from './types';

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
    <div className='spell-list-container'>
      <h2>Spell List</h2>

      <div className='filters'>
        <input
          type='text'
          placeholder='Search for spells...'
          className='search-input'
          value={filters.search}
          onChange={handleFilterChange('search')}
        />

        <div className='filter-controls'>
          <select
            className='filter-select'
            value={filters.level}
            onChange={handleFilterChange('level')}
          >
            <option value=''>All Levels</option>
            {SPELL_LEVELS.map((level) => (
              <option key={level} value={level}>
                Level {level === '0' ? 'Cantrip' : level}
              </option>
            ))}
          </select>

          <select
            className='filter-select'
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

      <div className='spell-list'>
        {isLoading ? (
          <div className='loading-state'>Loading spells...</div>
        ) : filteredSpells.length === 0 ? (
          <div className='empty-state'>No spells found</div>
        ) : (
          filteredSpells.map((spell) => (
            <button
              key={spell.index}
              className='spell-item'
              onClick={() => onSpellSelect(spell)}
            >
              <span className='spell-item-name'>{spell.name}</span>
              <div className='spell-item-meta'>
                <span>Level {spell.level === 0 ? 'Cantrip' : spell.level}</span>
                {spell.school && <span>{spell.school.name}</span>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SpellList;
