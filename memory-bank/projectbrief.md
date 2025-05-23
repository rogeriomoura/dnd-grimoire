# Project Brief: D&D 5e Grimoire Builder

## Overview

The D&D 5e Grimoire Builder is a web application that allows Dungeons & Dragons players to create, customize, and print their own spellbooks (grimoires). Users can browse the complete D&D 5th Edition spell list, search for specific spells, and add them to their personal grimoire for easy reference during gameplay.

## Core Requirements

1. **Spell Browsing**:

   - Display a searchable list of all D&D 5e spells
   - Allow filtering/searching by name, level, and school
   - Provide intuitive UI for browsing and selecting spells

2. **Grimoire Building**:

   - Add selected spells to a personal grimoire
   - Display detailed spell information in the grimoire
   - Create multiple grimoires with custom names through intuitive modal interface
   - Rename existing grimoires with persistent storage
   - Organize spells in a readable format
   - Provide user feedback for grimoire operations through toasts

3. **Printing Functionality**:

   - Allow users to print their completed grimoire
   - Format the grimoire appropriately for printing

4. **Data Integration**:
   - Fetch spell data from the D&D 5e API (https://www.dnd5eapi.co/api)
   - Handle API requests and responses efficiently
   - Implement proper error handling and retry mechanisms
   - Protect against API rate limiting with smart caching and request batching
   - Provide graceful degradation during API unavailability

## Target Users

- D&D players who want to create custom spellbooks for their spellcaster characters
- Dungeon Masters who need quick reference for NPC spellcasters
- New players who want to learn about available spells in the game

## Success Criteria

- Users can easily find and add spells to their grimoire
- The grimoire displays all relevant spell information clearly
- The application is intuitive and requires minimal instruction to use
- The printed grimoire is well-formatted and useful at the gaming table

## Future Enhancements (Potential)

- User accounts to save grimoires
- Additional filtering options (by class, level, school, etc.)
- Custom styling options for grimoires
- Export to PDF functionality
- Ability to add custom/homebrew spells
- Spell slot tracking
- Mobile-responsive design improvements
