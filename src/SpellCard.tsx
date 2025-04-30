import React, { useState } from 'react';
import { GrimoireSpell } from './types';

interface SpellCardProps {
  spell: GrimoireSpell;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get the first letter of the school name for the indicator
  const schoolLetter = spell.school?.name ? spell.school.name.charAt(0) : '';
  const schoolClass = spell.school?.name
    ? `school-${spell.school.name.toLowerCase()}`
    : '';

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`spell-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
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
          <p>
            <span className='spell-label'>Level:</span> {spell.level}
          </p>
          <p>
            <span className='spell-label'>School:</span> {spell.school?.name}
          </p>
          <p>
            <span className='spell-label'>Casting Time:</span>{' '}
            {spell.casting_time}
          </p>
          <p>
            <span className='spell-label'>Range:</span> {spell.range}
          </p>
          <p>
            <span className='spell-label'>Components:</span>{' '}
            {spell.components?.join(', ')}
          </p>
          {spell.material && (
            <p>
              <span className='spell-label'>Material:</span> {spell.material}
            </p>
          )}
          <p>
            <span className='spell-label'>Ritual:</span>{' '}
            {spell.ritual ? 'Yes' : 'No'}
          </p>
          <p>
            <span className='spell-label'>Concentration:</span>{' '}
            {spell.concentration ? 'Yes' : 'No'}
          </p>
          {spell.classes && spell.classes.length > 0 && (
            <p>
              <span className='spell-label'>Classes:</span>{' '}
              {spell.classes.map((c: any) => c.name).join(', ')}
            </p>
          )}
          <p>
            <span className='spell-label'>Duration:</span> {spell.duration}
          </p>
          <div className='spell-description'>
            <span className='spell-label'>Description:</span>
            {spell.desc?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {spell.higher_level && spell.higher_level.length > 0 && (
            <div className='spell-higher-level'>
              <span className='spell-label'>Higher Level:</span>
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
