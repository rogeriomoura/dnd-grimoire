import React, { useState } from 'react';
import { GrimoireSpell } from '../types';

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
      <div className='spell-card-header'>
        {spell.school && (
          <div
            className={`spell-school-badge ${schoolClass}`}
            title={spell.school.name}
          >
            {schoolLetter}
          </div>
        )}
        <h3 className='spell-card-title' onClick={toggleExpand}>
          {spell.name}
          <span className='expand-toggle'>{isExpanded ? '▼' : '►'}</span>
        </h3>
        <button className='btn-remove' onClick={onRemove} title='Remove spell'>
          ×
        </button>
      </div>

      {isExpanded && (
        <div className='spell-card-content'>
          <div className='spell-meta-grid'>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Level</span>
              <span className='spell-meta-value'>
                {spell.level === 0 ? 'Cantrip' : spell.level}
              </span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>School</span>
              <span className='spell-meta-value'>{spell.school?.name}</span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Range</span>
              <span className='spell-meta-value'>{spell.range}</span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Casting Time</span>
              <span className='spell-meta-value'>{spell.casting_time}</span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Duration</span>
              <span className='spell-meta-value'>
                {spell.duration}
                {spell.concentration && ' (Concentration)'}
              </span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Components</span>
              <span className='spell-meta-value'>
                {spell.components?.join(', ')}
              </span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Classes</span>
              <span className='spell-meta-value'>
                {spell.classes?.map((c: any) => c.name).join(', ')}
              </span>
            </div>
            <div className='spell-meta-item'>
              <span className='spell-meta-label'>Ritual</span>
              <span className='spell-meta-value'>
                {spell.ritual ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {spell.material && (
            <div className='spell-material'>
              <span className='spell-meta-label'>Material Components:</span>
              <p>{spell.material}</p>
            </div>
          )}

          <div className='spell-description'>
            <h4>Description</h4>
            {spell.desc?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {spell.higher_level && spell.higher_level.length > 0 && (
            <div className='spell-higher-level'>
              <h4>At Higher Levels</h4>
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

export { SpellCard };
