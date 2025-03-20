# Idle MMO Game

A browser-based idle MMO game built with Phaser 3, TypeScript, and NestJS.

## Overview

This project is a full-stack idle MMO game where players can create characters, equip items, and engage in combat. The game features:

- Character creation and management
- Inventory and equipment systems
- Combat with enemies in different zones
- Idle progression mechanics
- User authentication

## Project Structure

The project is divided into two main components:

- **Frontend**: Phaser 3 game client built with TypeScript
- **Backend**: NestJS server with SQLite database

## Quick Start

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run start:dev
```

The API server will be available at `http://localhost:3001`.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will be available at `http://localhost:8080`.

## Development Guidelines

See the following documentation for more detailed information:

- [Architecture Overview](./architecture.md)
- [Frontend Development Guide](./frontend-guide.md)
- [Backend Development Guide](./backend-guide.md)
- [Game Mechanics](./game-mechanics.md)
- [Contributing Guide](./contributing.md)

## License

[MIT](LICENSE) 