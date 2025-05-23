import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Grimoire, SpellList, GrimoireNameModal } from './components';
import { Spell, StoredGrimoires, Grimoire as GrimoireType } from './types';
import {
  // Storage utils
  initializeStorage,
  createGrimoire,
  saveGrimoire,
  deleteGrimoire,
  setActiveGrimoire as setActiveGrimoireStorage,
  addSpellToGrimoire,
  removeSpellFromGrimoire,
  updateGrimoireName,
  // API utils
  fetchSpellList,
  fetchSpellDetails,
  fetchApiData,
  // PDF utils
  createGrimoirePDF,
} from './utils';

import packageJson from '../package.json';
const version = packageJson.version;

function App() {
  // State management
  const [spells, setSpells] = useState<Spell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [storedGrimoires, setStoredGrimoires] = useState<StoredGrimoires>({
    version: '',
    grimoires: [],
  });
  const [activeGrimoire, setActiveGrimoire] = useState<GrimoireType | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Modal state management
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const grimoireRef = useRef<HTMLDivElement>(null);

  // Utility functions
  const showFeedback = (
    message: string,
    type: 'success' | 'error' | 'info'
  ) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const updateActiveGrimoire = (
    grimoires: StoredGrimoires,
    grimoireId: string
  ) => {
    setActiveGrimoire(
      grimoires.grimoires.find((g) => g.id === grimoireId) || null
    );
  };

  // Initialization effects
  useEffect(() => {
    // Preload common API endpoints to warm up the cache
    const preloadCommonData = async () => {
      try {
        await fetchApiData('/api/magic-schools');
        console.log('Preloaded magic schools data');
      } catch (error) {
        console.error('Error preloading common data:', error);
      }
    };

    const loadSpells = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        // Use the callback to update spells when full details are loaded
        const spellList = await fetchSpellList((fullSpellList) => {
          console.log('Full spell details loaded, updating state...');
          setSpells(fullSpellList);
          // If we were showing loading state, clear it now
          setIsLoading(false);
        });

        setSpells(spellList);

        // Preload other common data in the background
        preloadCommonData();

        // If we have minimal spell data but no level/school info yet,
        // keep loading state active until full details arrive
        const hasFullDetails = spellList.some(
          (s) => s.level > 0 || (s.school && s.school.name !== 'Unknown')
        );
        if (hasFullDetails) {
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Error loading spells:', error);
        setApiError(
          error instanceof Error
            ? error.message
            : 'Failed to load spells. Please try again later.'
        );
        showFeedback('Failed to load spells. Please try again later.', 'error');
        setIsLoading(false);
        setIsRetrying(false);
      } finally {
        setIsRetrying(false);
      }
    };

    loadSpells();
  }, [isRetrying]);

  useEffect(() => {
    const data = initializeStorage();
    setStoredGrimoires(data);

    // Set active grimoire if there's a last active one or create a default
    if (data.lastActiveGrimoireId) {
      const active = data.grimoires.find(
        (g) => g.id === data.lastActiveGrimoireId
      );
      if (active) {
        setActiveGrimoire(active);
      }
    } else if (data.grimoires.length > 0) {
      setActiveGrimoire(data.grimoires[0]);
    } else {
      // Create a default grimoire if none exists
      const defaultGrimoire = createGrimoire('My First Grimoire');
      const updatedData = saveGrimoire(defaultGrimoire);
      setStoredGrimoires(updatedData);
      setActiveGrimoire(defaultGrimoire);
    }
  }, []);

  // Event handlers
  const handleCreateGrimoire = (
    name: string,
    characterInfo?: { name?: string; level?: number; class?: string }
  ) => {
    const newGrimoire = createGrimoire(name, characterInfo);
    const updatedData = saveGrimoire(newGrimoire);
    setStoredGrimoires(updatedData);
    setActiveGrimoire(newGrimoire);
    showFeedback(`Created new grimoire: ${name}`, 'success');
  };

  const openCreateGrimoireModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleRenameGrimoire = (newName: string) => {
    if (!activeGrimoire) return;

    const updatedData = updateGrimoireName(activeGrimoire.id, newName);
    setStoredGrimoires(updatedData);
    updateActiveGrimoire(updatedData, activeGrimoire.id);
    showFeedback(`Renamed grimoire to: ${newName}`, 'success');
  };

  const handleSelectGrimoire = (id: string) => {
    const grimoire = storedGrimoires.grimoires.find((g) => g.id === id);
    if (grimoire) {
      setActiveGrimoire(grimoire);
      setActiveGrimoireStorage(id);
      showFeedback(`Switched to grimoire: ${grimoire.name}`, 'success');
    }
  };

  const handleDeleteGrimoire = (id: string) => {
    const grimoire = storedGrimoires.grimoires.find((g) => g.id === id);
    if (!grimoire) return;

    if (window.confirm(`Are you sure you want to delete "${grimoire.name}"?`)) {
      const updatedData = deleteGrimoire(id);
      setStoredGrimoires(updatedData);
      if (activeGrimoire?.id === id) {
        setActiveGrimoire(updatedData.grimoires[0] || null);
      }
      showFeedback(`Deleted grimoire: ${grimoire.name}`, 'success');
    }
  };

  const handleSpellSelect = async (spell: Spell) => {
    if (!activeGrimoire) {
      showFeedback('Please create or select a grimoire first', 'error');
      return;
    }

    // Don't add duplicate spells
    if (activeGrimoire.spells.some((s) => s.index === spell.index)) {
      showFeedback(`${spell.name} is already in your grimoire`, 'info');
      return;
    }

    try {
      // Show feedback immediately that we're working on it
      showFeedback(`Adding ${spell.name} to your grimoire...`, 'info');

      const spellDetails = await fetchSpellDetails(spell);
      const updatedData = addSpellToGrimoire(activeGrimoire.id, spellDetails);
      setStoredGrimoires(updatedData);
      updateActiveGrimoire(updatedData, activeGrimoire.id);
      showFeedback(`Added ${spell.name} to your grimoire`, 'success');
    } catch (error: any) {
      console.error('Error adding spell:', error);
      const errorMessage =
        error instanceof Error && error.message.includes('rate limit')
          ? `Rate limit reached. Please try again in a moment.`
          : `Failed to add ${spell.name}`;

      showFeedback(errorMessage, 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!activeGrimoire?.spells.length) return;

    setIsExporting(true);
    setExportError(null);

    try {
      await createGrimoirePDF(activeGrimoire.spells);
      showFeedback('Grimoire exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRemoveSpell = (spellIndex: string) => {
    if (!activeGrimoire) return;

    const updatedData = removeSpellFromGrimoire(activeGrimoire.id, spellIndex);
    setStoredGrimoires(updatedData);
    updateActiveGrimoire(updatedData, activeGrimoire.id);
  };

  // Render
  return (
    <div className='App'>
      <header className='header'>
        <div className='header-content'>
          <div className='header-title'>
            <h1>D&D 5e Grimoire Builder</h1>
            <span className='header-subtitle'>
              Create your perfect spellbook
            </span>
          </div>
          <div className='header-controls'>
            <div className='grimoire-selector'>
              <label htmlFor='grimoire-select'>Active Grimoire:</label>
              <select
                id='grimoire-select'
                value={activeGrimoire?.id || ''}
                onChange={(e) => handleSelectGrimoire(e.target.value)}
                className='select-modern'
              >
                <option value='' disabled>
                  Select a grimoire...
                </option>
                {storedGrimoires.grimoires.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.spells.length} spells)
                  </option>
                ))}
              </select>
            </div>
            <div className='header-actions'>
              <button
                onClick={openCreateGrimoireModal}
                className='btn btn-primary'
              >
                <span>📚</span> New Grimoire
              </button>
              {activeGrimoire && (
                <button
                  onClick={() => handleDeleteGrimoire(activeGrimoire.id)}
                  className='btn btn-danger'
                >
                  <span>🗑️</span> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className='main-content'>
        <div className='content-grid'>
          <div className='spell-browser'>
            {apiError ? (
              <div className='error-container'>
                <div className='error-message'>
                  <h3>🔮 Spell Loading Error</h3>
                  <p>{apiError}</p>
                  <button
                    className='btn btn-primary'
                    onClick={() => setIsRetrying(true)}
                    disabled={isRetrying}
                  >
                    {isRetrying ? 'Retrying...' : 'Retry Loading Spells'}
                  </button>
                </div>
              </div>
            ) : (
              <SpellList
                spells={spells}
                onSpellSelect={handleSpellSelect}
                isLoading={isLoading}
              />
            )}
          </div>
          <div className='grimoire-panel'>
            {activeGrimoire ? (
              <Grimoire
                ref={grimoireRef}
                name={activeGrimoire.name}
                spells={activeGrimoire.spells}
                onRemoveSpell={handleRemoveSpell}
                onRename={() => setIsRenameModalOpen(true)}
                onExport={handleExportPDF}
                isExporting={isExporting}
                exportError={exportError}
              />
            ) : (
              <div className='no-grimoire-state'>
                <div className='no-grimoire-content'>
                  <h3>No Grimoire Selected</h3>
                  <p>
                    Create a new grimoire or select an existing one to get
                    started.
                  </p>
                  <button
                    onClick={openCreateGrimoireModal}
                    className='btn btn-primary btn-large'
                  >
                    <span>✨</span> Create Your First Grimoire
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {feedback && (
        <div className={`toast toast-${feedback.type}`}>
          <div className='toast-content'>
            <span className='toast-icon'>
              {feedback.type === 'success' && '✅'}
              {feedback.type === 'error' && '❌'}
              {feedback.type === 'info' && 'ℹ️'}
            </span>
            {feedback.message}
          </div>
        </div>
      )}
      <div className='version-badge'>v{version}</div>

      {/* Create Grimoire Modal */}
      <GrimoireNameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(name) => {
          handleCreateGrimoire(name);
          setIsCreateModalOpen(false);
        }}
        title='Create New Grimoire'
        saveLabel='Create'
      />

      {/* Rename Grimoire Modal */}
      {activeGrimoire && (
        <GrimoireNameModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          onSave={handleRenameGrimoire}
          initialName={activeGrimoire.name}
          title='Rename Grimoire'
          saveLabel='Rename'
        />
      )}
    </div>
  );
}

export default App;
