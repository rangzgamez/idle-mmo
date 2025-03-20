# Frontend Development Guide

This guide explains how to work with the frontend codebase of the Idle MMO game.

## Technology Stack

- **Game Engine**: Phaser 3
- **Language**: TypeScript
- **Build Tool**: Webpack
- **Package Manager**: npm

## Project Structure

```
frontend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Game configuration
│   ├── constants.ts          # Game constants
│   ├── assets/               # Game assets (images, audio)
│   ├── models/               # TypeScript interfaces
│   ├── scenes/               # Phaser scenes
│   ├── services/             # API services
│   └── ui/                   # UI components
├── public/                   # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── webpack.config.js         # Webpack configuration
```

## Getting Started

1. **Install Dependencies**

```bash
cd frontend
npm install
```

2. **Start Development Server**

```bash
npm run dev
```

This will start the development server at http://localhost:8080 with hot module reloading.

3. **Build for Production**

```bash
npm run build
```

This will create a production-ready build in the `dist` folder.

## Working with Scenes

### Scene Lifecycle

Phaser scenes follow this lifecycle:

1. `constructor()` - Initialize scene properties
2. `preload()` - Load assets (images, sprites, sounds)
3. `create()` - Create game objects and set up the scene
4. `update(time, delta)` - Run game logic on each frame
5. `destroy()` - Clean up resources when the scene is shut down

### Creating a New Scene

1. Create a new file in the `src/scenes` directory:

```typescript
import Phaser from 'phaser';

export class NewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NewScene' });
  }

  preload() {
    // Load assets
  }

  create() {
    // Create game objects
  }

  update(time: number, delta: number) {
    // Update logic
  }
}
```

2. Register the scene in `src/config.ts`:

```typescript
import { NewScene } from './scenes/NewScene';

const config = {
  // ... other config
  scene: [
    // ... other scenes
    NewScene
  ]
};
```

3. Navigate to your scene from another scene:

```typescript
this.scene.start('NewScene', { data: 'to pass' });
```

## Using API Services

API services are used to communicate with the backend. They are located in `src/services`.

Example usage:

```typescript
import { apiService } from '../services/api.service';

// In a Phaser scene or component
async loadCharacters() {
  try {
    const characters = await apiService.getCharacters();
    // Do something with characters
  } catch (error) {
    console.error('Failed to load characters', error);
  }
}
```

## Adding Items and Equipment

To add new item types to the game:

1. Update the `Item` interface in `src/models/Item.ts`
2. Add appropriate sprites in `assets/images/items/`
3. Update the `InventoryScene` to handle the new item type
4. If needed, update the `equipItem` method in the API service

## UI Development

UI elements are built using Phaser's game objects. Common patterns include:

### Text

```typescript
const text = this.add.text(x, y, 'Hello World', {
  fontSize: '24px',
  color: '#ffffff'
});
```

### Containers

Use containers to group related UI elements:

```typescript
const container = this.add.container(x, y);
container.add(background);
container.add(text);
```

### Interactive Objects

Make objects interactive:

```typescript
const button = this.add.sprite(x, y, 'button');
button.setInteractive();
button.on('pointerdown', () => {
  // Handle click
});
```

## Drag and Drop Implementation

The game uses Phaser's built-in drag and drop functionality:

```typescript
// Enable drag
object.setInteractive({ draggable: true });

// Events
object.on('dragstart', handleDragStart);
object.on('drag', handleDrag);
object.on('dragend', handleDragEnd);

// Drop zones
dropZone.setInteractive({ dropZone: true });
this.input.on('drop', handleDrop);
```

## Game State Management

Game state is managed through:

1. **Scene data** - Pass data between scenes
2. **Local Storage** - Persist data between sessions
3. **API calls** - Sync with backend database

## Debugging

1. **Browser Console**
   - Use `console.log()` statements to debug
   - Inspect network requests to API endpoints

2. **Phaser Debug**
   - Enable debug mode in `config.ts`:
   ```typescript
   physics: {
     default: 'arcade',
     arcade: {
       debug: true
     }
   }
   ```

3. **Performance Monitoring**
   - Use the browser's performance tools to monitor FPS and memory usage

## Adding Assets

1. Place new assets in the `src/assets/` directory
2. Load them in the appropriate scene's `preload()` method:

```typescript
preload() {
  this.load.image('asset-key', 'assets/images/filename.png');
  this.load.spritesheet('character', 'assets/images/character.png', {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.audio('sound', 'assets/audio/sound.mp3');
}
```

## Best Practices

1. **TypeScript Types**
   - Use interfaces for all game objects
   - Avoid using `any` type when possible

2. **Asset Management**
   - Optimize images before adding them to the game
   - Use texture atlases for related sprites

3. **Code Organization**
   - Keep scene files focused on one responsibility
   - Extract reusable logic to utility functions or services

4. **Performance**
   - Use object pooling for frequently created/destroyed objects
   - Limit the number of physics objects
   - Use containers for grouping static UI elements 