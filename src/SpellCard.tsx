import React, { useState } from 'react';
import { GrimoireSpell } from './types';

interface SpellCardProps {
  spell: GrimoireSpell;
  onRemove: () => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const schoolLetter = spell.school?.name ? spell.school.name.charAt(0) : '';
  const schoolClass = spell.school?.name
    ? `school-${spell.school.name.toLowerCase()}`
    : '';

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`spell-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className='remove-spell' onClick={onRemove} title='Remove spell'>
        ×
      </button>
      {spell.school && (
        <div
          className={`spell-school ${schoolClass}`}
          title={spell.school.name}
        >
          {schoolLetter}
        </div>
      )}
      <h3 className='spell-name' onClick={toggleExpand}>
        {spell.name}
        <span className='expand-icon'>{isExpanded ? '▼' : '►'}</span>
      </h3>
      {isExpanded && (
        <div>
          <div className='spell-details-grid'>
            <div className='spell-detail-column'>
              <p>
                <span className='spell-label'>Level:</span> {spell.level}
              </p>
              <p>
                <span className='spell-label'>School:</span>{' '}
                {spell.school?.name}
              </p>
              <p>
                <span className='spell-label'>Range:</span> {spell.range}
              </p>
            </div>
            <div className='spell-detail-column'>
              <p>
                <span className='spell-label'>Casting:</span>{' '}
                {spell.casting_time}
              </p>
              <p>
                <span className='spell-label'>Duration:</span> {spell.duration}
                {spell.concentration && ' (Concentration)'}
              </p>
              <p>
                <span className='spell-label'>Components:</span>{' '}
                {spell.components?.join(', ')}
              </p>
            </div>
            <div className='spell-detail-column'>
              <p>
                <span className='spell-label'>Classes:</span>{' '}
                {spell.classes?.map((c: any) => c.name).join(', ')}
              </p>
              <p>
                <span className='spell-label'>Ritual:</span>{' '}
                {spell.ritual ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {spell.material && (
            <p className='spell-material'>
              <span className='spell-label'>Material:</span> {spell.material}
            </p>
          )}

          <div className='spell-description'>
            {spell.desc?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {spell.higher_level && spell.higher_level.length > 0 && (
            <div className='spell-higher-level'>
              <span className='spell-label'>At Higher Levels:</span>
              {spell.higher_level.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpellCard;
