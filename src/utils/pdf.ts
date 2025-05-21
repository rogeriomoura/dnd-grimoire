import { jsPDF } from 'jspdf';
import { GrimoireSpell } from '../types';

export const createGrimoirePDF = async (
  spells: GrimoireSpell[]
): Promise<void> => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let y = 20;

  doc.setFontSize(24);
  doc.text('My Grimoire', 20, y);
  y += 20;

  spells.forEach((spell) => {
    // Add a new page if we're near the bottom
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    // Spell name
    doc.setFontSize(16);
    doc.text(spell.name, 20, y);
    y += 10;

    // Spell details
    doc.setFontSize(10);
    doc.text(`Level: ${spell.level}`, 20, y);
    y += 5;
    doc.text(`Casting Time: ${spell.casting_time}`, 20, y);
    y += 5;
    doc.text(`Range: ${spell.range}`, 20, y);
    y += 5;
    doc.text(`Duration: ${spell.duration}`, 20, y);
    y += 5;

    // Spell description
    const description = spell.desc.join('\n');
    const lines = doc.splitTextToSize(description, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 10;

    // Higher level casting
    if (spell.higher_level && spell.higher_level.length > 0) {
      doc.setFontSize(12);
      doc.text('At Higher Levels:', 20, y);
      y += 5;
      doc.setFontSize(10);
      const higherLevelText = spell.higher_level.join('\n');
      const higherLevelLines = doc.splitTextToSize(higherLevelText, 170);
      doc.text(higherLevelLines, 20, y);
      y += higherLevelLines.length * 5 + 10;
    }

    // Add some spacing between spells
    y += 10;
  });

  doc.save('my-grimoire.pdf');
};
