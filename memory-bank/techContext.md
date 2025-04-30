# Technical Context: D&D 5e Grimoire Builder

## Technologies Used

### Core Technologies

1. **React (18.x)**

   - JavaScript library for building user interfaces
   - Used for creating component-based UI architecture
   - Provides efficient rendering through virtual DOM

2. **TypeScript (4.x)**

   - Superset of JavaScript that adds static typing
   - Enhances code quality and developer experience
   - Provides better tooling and autocompletion

3. **CSS3**
   - Used for styling components
   - Implements responsive design principles
   - Handles print layout formatting

### Development Tools

1. **Create React App**

   - Used to bootstrap the project
   - Provides a standardized build configuration
   - Includes development server with hot reloading

2. **npm/pnpm**

   - Package management
   - Dependency resolution
   - Script running

3. **Git**
   - Version control
   - Collaboration
   - Change tracking

## Development Setup

### Prerequisites

- Node.js (v14+)
- npm (v6+) or pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Development

1. **Installation**

   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to project directory
   cd dnd-grimoire

   # Install dependencies
   npm install
   # or
   pnpm install
   ```

2. **Running the Development Server**

   ```bash
   npm start
   # or
   pnpm start
   ```

   This starts the development server at http://localhost:3000 with hot reloading enabled.

3. **Building for Production**
   ```bash
   npm run build
   # or
   pnpm build
   ```
   This creates an optimized production build in the `build` directory.

## Technical Constraints

1. **API Limitations**

   - The D&D 5e API (https://www.dnd5eapi.co/api) is a third-party service
   - No authentication required, but rate limiting may apply
   - API availability impacts application functionality
   - No write operations available (read-only API)

2. **Browser Compatibility**

   - Application targets modern browsers (last 2 versions)
   - Print functionality depends on browser's print capabilities
   - Local storage limitations based on browser settings

3. **Performance Considerations**

   - Initial load requires fetching the complete spell list
   - Each spell selection requires an additional API call
   - Large grimoires may impact print performance

4. **Deployment**
   - Static site hosting only (no server-side requirements)
   - CORS considerations for API requests in production

## Dependencies

### Production Dependencies

- **react**: Core React library
- **react-dom**: React rendering for web
- **react-scripts**: Configuration and scripts for Create React App
- **typescript**: TypeScript language support
- **web-vitals**: Library for measuring web performance metrics

### Development Dependencies

- **@testing-library/react**: Testing utilities for React
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: Simulating user events for testing
- **@types/react**: TypeScript type definitions for React
- **@types/react-dom**: TypeScript type definitions for React DOM
- **@types/jest**: TypeScript type definitions for Jest

## Tool Usage Patterns

### State Management

The application uses React's built-in state management with hooks:

- **useState**: For component-level state (search terms, UI state)
- **useEffect**: For side effects like API calls and data fetching

Example pattern:

```typescript
// Fetching spell list
useEffect(() => {
  async function loadSpells() {
    try {
      const response = await fetch(`${BASE_API}/spells`);
      const data = await response.json();
      setSpells(data.results);
    } catch (error) {
      console.error('Error loading spells:', error);
    }
  }

  loadSpells();
}, []);
```

### API Integration

The application follows a consistent pattern for API calls:

1. Define base API URL as a constant
2. Use fetch API for HTTP requests
3. Handle responses with async/await
4. Transform API data to match application interfaces
5. Update state with the transformed data
6. Implement error handling

Example pattern:

```typescript
const handleSpellSelect = async (spell: Spell) => {
  try {
    const response = await fetch(`${BASE_API}/spells/${spell.index}`);
    const spellDetails: GrimoireSpell = await response.json();
    setGrimoire([...grimoire, spellDetails]);
  } catch (error) {
    console.error('Error loading spell details:', error);
  }
};
```

### Component Structure

Components follow a consistent structure:

1. Import statements
2. Interface definitions for props
3. Functional component definition
4. State and effect hooks
5. Helper functions
6. Return statement with JSX
7. Export statement

Example pattern:

```typescript
import React, { useState } from 'react';
import { SomeType } from './types';

interface ComponentProps {
  someProp: SomeType;
  onSomeAction: (param: SomeType) => void;
}

const Component: React.FC<ComponentProps> = ({ someProp, onSomeAction }) => {
  const [someState, setSomeState] = useState<string>('');

  const handleSomeEvent = () => {
    // Implementation
  };

  return <div>{/* JSX content */}</div>;
};

export default Component;
```

This technical context provides a comprehensive overview of the technologies, tools, and patterns used in the D&D 5e Grimoire Builder application, serving as a reference for development decisions and onboarding.
