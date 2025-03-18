# Idle MMO Game

A browser-based idle MMO game inspired by Granado Espada, built with Phaser.js and NestJS.

## Features

- Party-based gameplay with 3 characters in a triangle formation
- Multiple character classes: Fighter, Priest, Rogue, Archer, Wizard
- Automatic combat with enemies
- Character progression and leveling system
- Item drops and inventory management
- Different game zones with varying enemy difficulty

## Tech Stack

- **Frontend**: Phaser.js, TypeScript, Webpack
- **Backend**: NestJS, TypeORM, SQLite

## Project Structure

```
/
├── frontend/             # Phaser.js frontend
│   ├── src/
│   │   ├── assets/       # Game assets (images, audio)
│   │   ├── models/       # TypeScript interfaces and types
│   │   ├── scenes/       # Phaser game scenes
│   │   └── index.ts      # Main entry point
│   ├── package.json
│   └── webpack.config.js
│
└── backend/              # NestJS backend
    ├── src/
    │   ├── users/        # User management module
    │   ├── characters/   # Character management module
    │   ├── items/        # Item management module
    │   └── main.ts       # Main entry point
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run start:dev
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
3. Open your browser and navigate to `http://localhost:8080`

## Game Mechanics

- **Barracks**: Create and manage your characters
- **World Map**: Select different zones to venture into
- **Combat**: Characters automatically attack nearby enemies
- **Skills**: Activate special abilities using MP
- **Loot**: Collect items dropped by defeated enemies

## License

MIT License 