import React, { useState, useEffect, useRef } from 'react';

interface GrimoireNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  title: string;
  saveLabel?: string;
}

export const GrimoireNameModal: React.FC<GrimoireNameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  title,
  saveLabel = 'Save',
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal'>
        <div className='modal-header'>
          <h3>{title}</h3>
          <button className='modal-close' onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='modal-body'>
            <div className='form-group'>
              <label htmlFor='grimoire-name'>Grimoire Name:</label>
              <input
                ref={inputRef}
                type='text'
                id='grimoire-name'
                className='input-modern modal-input'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter a name for your grimoire'
                required
              />
            </div>
          </div>
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={!name.trim()}
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrimoireNameModal;
