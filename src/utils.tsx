import { GrimoireSpell } from './types';
import jsPDF from 'jspdf';

// Cache keys and expiration time
export const CACHE_KEYS = {
  SPELL_LIST: 'dnd-grimoire-spell-list-cache',
  SPELL_DETAILS: 'dnd-grimoire-spell-details-cache',
};

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const getCachedData = <T,>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp }: CacheEntry<T> = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_EXPIRATION) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
};

export const setCachedData = <T,>(key: string, data: T): void => {
  const cacheEntry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
};

// Font size constants
const FONT_SIZES = {
  TITLE: 20, // Was 24
  SECTION_HEADER: 16, // Was 18
  SPELL_NAME: 12, // Was 14
  BODY: 8, // Was 10
  SMALL: 7, // Was 8
};

// Color scheme
const COLORS = {
  PRIMARY: '#7a200d', // Deep red for headers
  SECONDARY: '#d9b26f', // Gold for accents
  TEXT: '#2c2c2c', // Dark grey for main text
  LIGHT_BG: '#f8f0dd', // Light parchment color
  SCHOOL_COLORS: {
    Abjuration: '#5e81ac',
    Conjuration: '#b48ead',
    Divination: '#81a1c1',
    Enchantment: '#d08770',
    Evocation: '#bf616a',
    Illusion: '#a3be8c',
    Necromancy: '#4c566a',
    Transmutation: '#ebcb8b',
  },
};

export const createGrimoirePDF = async (
  grimoire: GrimoireSpell[]
): Promise<void> => {
  try {
    if (!grimoire.length) {
      throw new Error('No spells in grimoire');
    }

    // Initialize PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to add a new page
    const addNewPage = (withBackground = true) => {
      pdf.addPage();
      if (withBackground) {
        pdf.setFillColor(COLORS.LIGHT_BG);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      return margin;
    };

    // Helper function for text wrapping
    const wrapText = (text: string, maxWidth: number): string[] => {
      return pdf.splitTextToSize(text, maxWidth);
    };

    // Add decorative border
    const addPageBorder = () => {
      pdf.setDrawColor(COLORS.SECONDARY);
      pdf.setLineWidth(0.5);
      pdf.rect(
        margin / 2,
        margin / 2,
        pageWidth - margin,
        pageHeight - margin,
        'S'
      );
    };

    // Draw a spell card
    const drawSpellCard = (
      spell: GrimoireSpell,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      // Card background
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(COLORS.SECONDARY);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(x, y, width, height, 3, 3, 'FD');

      let currentY = y + 5;
      const innerMargin = 5;
      const innerWidth = width - innerMargin * 2;

      // Spell name and school indicator
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(FONT_SIZES.SPELL_NAME);
      pdf.setTextColor(COLORS.PRIMARY);

      // School indicator
      if (spell.school?.name) {
        const schoolColor =
          COLORS.SCHOOL_COLORS[
            spell.school.name as keyof typeof COLORS.SCHOOL_COLORS
          ] || COLORS.PRIMARY;
        pdf.setFillColor(schoolColor);
        pdf.circle(x + width - 8, currentY + 2, 4, 'F');
        pdf.setTextColor(255);
        pdf.setFontSize(FONT_SIZES.SMALL);
        pdf.text(spell.school.name[0], x + width - 9.5, currentY + 3.5);
      }

      // Spell name
      pdf.setTextColor(COLORS.PRIMARY);
      pdf.setFontSize(FONT_SIZES.SPELL_NAME);
      pdf.text(spell.name, x + width / 2, currentY + 3, { align: 'center' });
      currentY += 12;

      // Separator line
      pdf.setDrawColor(COLORS.SECONDARY);
      pdf.setLineWidth(0.2);
      pdf.line(x + innerMargin, currentY, x + width - innerMargin, currentY);
      currentY += 5;

      // Basic info
      pdf.setFontSize(FONT_SIZES.BODY);
      pdf.setTextColor(COLORS.TEXT);
      const infoGrid = [
        [
          `Level: ${spell.level === 0 ? 'Cantrip' : spell.level}`,
          `School: ${spell.school?.name || 'Unknown'}`,
        ],
        [`Casting: ${spell.casting_time}`, `Range: ${spell.range}`],
        [
          `Duration: ${spell.duration}${spell.concentration ? ' (C)' : ''}`,
          `Components: ${spell.components.join(', ')}`,
        ],
      ];

      infoGrid.forEach((row) => {
        row.forEach((text, index) => {
          pdf.setFont('helvetica', 'bold');
          const label = text.split(':')[0] + ':';
          const value = text.split(':')[1];
          const x1 = x + innerMargin + index * (innerWidth / 2);
          pdf.text(label, x1, currentY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(value, x1 + pdf.getTextWidth(label), currentY);
        });
        currentY += 5;
      });
      currentY += 2;

      // Material components if any
      if (spell.material) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Materials:', x + innerMargin, currentY);
        pdf.setFont('helvetica', 'italic');
        const wrappedMaterial = wrapText(spell.material, innerWidth - 20);
        wrappedMaterial.forEach((line, i) => {
          pdf.text(line, x + innerMargin + 20, currentY);
          currentY += 4;
        });
        currentY += 2;
      }

      // Description
      if (spell.desc?.length) {
        pdf.setFont('helvetica', 'normal');
        spell.desc.forEach((paragraph) => {
          const wrappedDesc = wrapText(paragraph, innerWidth);
          wrappedDesc.forEach((line) => {
            pdf.text(line, x + innerMargin, currentY);
            currentY += 4;
          });
          currentY += 2;
        });
      }

      // Higher levels
      if (spell.higher_level?.length) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('At Higher Levels:', x + innerMargin, currentY);
        currentY += 5;
        pdf.setFont('helvetica', 'italic');
        spell.higher_level.forEach((paragraph) => {
          const wrappedHigherLevel = wrapText(paragraph, innerWidth);
          wrappedHigherLevel.forEach((line) => {
            pdf.text(line, x + innerMargin, currentY);
            currentY += 4;
          });
          currentY += 2;
        });
      }
    };

    // Create cover page
    pdf.setFillColor(COLORS.LIGHT_BG);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    addPageBorder();

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.TITLE * 1.5);
    pdf.setTextColor(COLORS.PRIMARY);
    pdf.text('Grimoire', pageWidth / 2, pageHeight / 3, { align: 'center' });

    // Subtitle
    pdf.setFontSize(FONT_SIZES.SECTION_HEADER);
    pdf.text('D&D 5th Edition', pageWidth / 2, pageHeight / 3 + 20, {
      align: 'center',
    });

    // Date
    pdf.setFontSize(FONT_SIZES.BODY);
    pdf.setTextColor(COLORS.TEXT);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    pdf.text(date, pageWidth / 2, pageHeight / 3 + 40, { align: 'center' });

    // Create table of contents
    let yPos = addNewPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.TITLE);
    pdf.setTextColor(COLORS.PRIMARY);
    pdf.text('Table of Contents', pageWidth / 2, yPos + 20, {
      align: 'center',
    });
    addPageBorder();

    // Group spells by level
    const spellsByLevel = grimoire.reduce((acc, spell) => {
      const level = spell.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {} as Record<number, GrimoireSpell[]>);

    // Sort levels
    const levels = Object.keys(spellsByLevel).sort(
      (a, b) => Number(a) - Number(b)
    );

    // Add TOC entries
    yPos = margin + 40;
    pdf.setFontSize(FONT_SIZES.BODY);
    pdf.setTextColor(COLORS.TEXT);

    for (const level of levels) {
      if (yPos > pageHeight - margin * 2) {
        yPos = addNewPage();
        addPageBorder();
      }
      const levelText =
        Number(level) === 0 ? 'Cantrips' : `Level ${level} Spells`;
      pdf.setFont('helvetica', 'bold');
      pdf.text(levelText, margin, yPos);
      yPos += 8;

      pdf.setFont('helvetica', 'normal');
      for (const spell of spellsByLevel[Number(level)]) {
        if (yPos > pageHeight - margin) {
          yPos = addNewPage();
          addPageBorder();
        }
        pdf.text(`• ${spell.name}`, margin + 10, yPos);
        yPos += 6;
      }
      yPos += 5;
    }

    // Add spell cards
    for (const level of levels) {
      // Add level header
      yPos = addNewPage();
      addPageBorder();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(FONT_SIZES.TITLE);
      pdf.setTextColor(COLORS.PRIMARY);
      const levelText =
        Number(level) === 0 ? 'Cantrips' : `Level ${level} Spells`;
      pdf.text(levelText, pageWidth / 2, yPos + 20, { align: 'center' });
      yPos += 30;

      // Calculate card dimensions
      const cardWidth = (contentWidth - margin) / 2;
      const cardHeight = 180; // Fixed height for cards
      let currentX = margin;

      // Add spell cards for this level
      for (const spell of spellsByLevel[Number(level)]) {
        // Check if we need to start a new row or page
        if (currentX + cardWidth > pageWidth - margin) {
          currentX = margin;
          yPos += cardHeight + 10;
        }

        // Check if we need a new page
        if (yPos + cardHeight > pageHeight - margin) {
          yPos = addNewPage();
          addPageBorder();
          currentX = margin;
        }

        // Draw the spell card
        drawSpellCard(spell, currentX, yPos, cardWidth, cardHeight);
        currentX += cardWidth + 10;
      }
    }

    // Add page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(FONT_SIZES.SMALL);
      pdf.setTextColor(COLORS.TEXT);
      pdf.text(`${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      });
    }

    // Save the PDF
    pdf.save('grimoire.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
