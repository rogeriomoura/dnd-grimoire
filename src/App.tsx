import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SpellList from './SpellList';
import Grimoire from './Grimoire';
import { Spell, GrimoireSpell } from './types';
import jsPDF from 'jspdf';

const BASE_API = 'https://www.dnd5eapi.co/api';

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [grimoire, setGrimoire] = useState<GrimoireSpell[]>([]);

  useEffect(() => {
    async function loadSpells() {
      try {
        const response = await fetch(`${BASE_API}/spells`);
        const data = await response.json();
        const spellList: Spell[] = data.results.map((spell: any) => ({
          index: spell.index,
          name: spell.name,
          level: spell.level,
          url: spell.url,
        }));
        setSpells(spellList);
      } catch (error) {
        console.error('Error loading spells:', error);
      }
    }

    loadSpells();
  }, []);

  const handleSpellSelect = async (spell: Spell) => {
    try {
      const response = await fetch(`${BASE_API}/spells/${spell.index}`);
      const spellDetails: GrimoireSpell = await response.json();
      setGrimoire([...grimoire, spellDetails]);
    } catch (error) {
      console.error('Error loading spell details:', error);
    }
  };

  const grimoireRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportToPDF = async () => {
    if (!grimoireRef.current || grimoire.length === 0) return;

    setIsExporting(true);
    setExportError(null);

    try {
      // Create a PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Set font and styles
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(122, 32, 13); // #7a200d

      // Add title
      pdf.text('D&D 5e Grimoire', pdfWidth / 2, 20, { align: 'center' });

      let yPosition = 40;
      const margin = 15;
      const lineHeight = 10;

      // Add each spell to the PDF
      for (const spell of grimoire) {
        // Check if we need a new page
        if (yPosition > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add spell name
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(122, 32, 13); // #7a200d
        pdf.text(spell.name, pdfWidth / 2, yPosition, { align: 'center' });
        yPosition += lineHeight + 5;

        // Add spell details
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0); // Black

        // Level and school
        pdf.text(
          `Level: ${spell.level} | School: ${spell.school?.name || 'Unknown'}`,
          margin,
          yPosition
        );
        yPosition += lineHeight;

        // Casting time and range
        pdf.text(
          `Casting Time: ${spell.casting_time} | Range: ${spell.range}`,
          margin,
          yPosition
        );
        yPosition += lineHeight;

        // Components and material
        pdf.text(
          `Components: ${spell.components?.join(', ')}`,
          margin,
          yPosition
        );
        yPosition += lineHeight;

        if (spell.material) {
          // Check if text will fit on current page
          if (yPosition > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          // Split material text to fit within page width
          const materialLines = pdf.splitTextToSize(
            `Material: ${spell.material}`,
            pdfWidth - margin * 2
          );
          pdf.text(materialLines, margin, yPosition);
          yPosition += lineHeight * materialLines.length;
        }

        // Duration and concentration
        pdf.text(
          `Duration: ${spell.duration} | Concentration: ${
            spell.concentration ? 'Yes' : 'No'
          }`,
          margin,
          yPosition
        );
        yPosition += lineHeight;

        // Classes
        if (spell.classes && spell.classes.length > 0) {
          const classNames = spell.classes.map((c: any) => c.name).join(', ');
          pdf.text(`Classes: ${classNames}`, margin, yPosition);
          yPosition += lineHeight;
        }

        // Description
        if (spell.desc && spell.desc.length > 0) {
          yPosition += 5;

          // Check if text will fit on current page
          if (yPosition > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFont('helvetica', 'bold');
          pdf.text('Description:', margin, yPosition);
          yPosition += lineHeight;

          pdf.setFont('helvetica', 'normal');
          for (const paragraph of spell.desc) {
            // Split text to fit within page width
            const lines = pdf.splitTextToSize(paragraph, pdfWidth - margin * 2);

            // Check if text will fit on current page
            if (yPosition + lineHeight * lines.length > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.text(lines, margin, yPosition);
            yPosition += lineHeight * lines.length + 5;
          }
        }

        // Higher level
        if (spell.higher_level && spell.higher_level.length > 0) {
          // Check if text will fit on current page
          if (yPosition > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFont('helvetica', 'bold');
          pdf.text('At Higher Levels:', margin, yPosition);
          yPosition += lineHeight;

          pdf.setFont('helvetica', 'normal');
          for (const paragraph of spell.higher_level) {
            // Split text to fit within page width
            const lines = pdf.splitTextToSize(paragraph, pdfWidth - margin * 2);

            // Check if text will fit on current page
            if (yPosition + lineHeight * lines.length > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.text(lines, margin, yPosition);
            yPosition += lineHeight * lines.length + 5;
          }
        }

        // Add separator between spells
        yPosition += 10;
        pdf.setDrawColor(217, 178, 111); // #d9b26f
        pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
        yPosition += 15;
      }

      // Save the PDF
      pdf.save('dnd-grimoire.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='App'>
      <h1>D&D 5e Grimoire Builder</h1>
      <div className='container'>
        <SpellList spells={spells} onSpellSelect={handleSpellSelect} />
        <div ref={grimoireRef}>
          <Grimoire grimoire={grimoire} />
        </div>
      </div>
      <div className='export-container'>
        <button
          className='export-button'
          onClick={exportToPDF}
          disabled={isExporting || grimoire.length === 0}
        >
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
        {exportError && <div className='export-error'>{exportError}</div>}
      </div>
    </div>
  );
}

export default App;
