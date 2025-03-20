# Architecture Overview

This document outlines the architectural patterns and design decisions used in the Idle MMO game.

## System Architecture

The game follows a client-server architecture:

```
┌─────────────────┐     HTTP/REST    ┌─────────────────┐
│                 │<---------------->│                 │
│  Phaser Client  │                  │   NestJS API    │
│   (Frontend)    │                  │    (Backend)    │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
                                            │
                                            │
                                            v
                                     ┌─────────────────┐
                                     │                 │
                                     │     SQLite      │
                                     │   Database      │
                                     │                 │
                                     └─────────────────┘
```

## Frontend Architecture

The frontend is built using Phaser 3 and TypeScript, following a scene-based architecture.

### Core Components

1. **Scene Management**
   - Each game screen is represented by a Phaser Scene (e.g., `BarracksScene`, `WorldMapScene`, `CombatScene`)
   - Scenes handle their own initialization, rendering, and cleanup

2. **Data Models**
   - TypeScript interfaces define game entities (`Character`, `Item`, etc.)
   - Models are shared between different scenes

3. **Services**
   - The `apiService` acts as a bridge between the frontend and backend
   - Handles authentication, data fetching, and state persistence

4. **Component Pattern**
   - Reusable UI components are implemented as Phaser game objects

### Scene Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  AuthScene  │---->│  Barracks   │---->│  WorldMap   │
│             │     │    Scene    │     │    Scene    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
                     ┌─────────────┐     ┌─────────────┐
                     │             │     │             │
                     │ Inventory/  │<----│   Combat    │
                     │ Equipment   │     │    Scene    │
                     │             │     │             │
                     └─────────────┘     └─────────────┘
```

## Backend Architecture

The backend is built using NestJS, following a modular architecture with separation of concerns.

### Core Components

1. **Controllers**
   - Handle HTTP requests and define API endpoints
   - Validate incoming data using DTOs (Data Transfer Objects)

2. **Services**
   - Contain business logic
   - Handle data manipulation and persistence
   - Implement game mechanics (combat, progression, etc.)

3. **Repositories**
   - Interface with the database using TypeORM
   - Handle CRUD operations for game entities

4. **Entities**
   - Define database schemas using TypeORM decorators
   - Map to database tables

### Module Structure

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│    Users    │---->│  Characters │---->│    Items    │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      └───────────────────v────────────────────┘
                          │
                          v
                  ┌─────────────────┐
                  │                 │
                  │     Combat      │
                  │                 │
                  └─────────────────┘
```

## Design Patterns

### Frontend Patterns

1. **Scene State Management**
   - Each scene manages its own state
   - Inter-scene communication happens through scene data objects

2. **Service Pattern**
   - API services abstract backend communication
   - Centralized error handling and authentication

3. **Component Composition**
   - UI elements are composed of reusable Phaser components

### Backend Patterns

1. **Repository Pattern**
   - Data access logic is isolated in repository classes
   - Services depend on repositories for data operations

2. **Dependency Injection**
   - NestJS provides a DI container
   - Services and repositories are injected where needed

3. **DTO Pattern**
   - Data Transfer Objects validate incoming requests
   - Separate from entity models

## Data Flow

1. User interacts with the game UI in the browser
2. Phaser scene handles the interaction and calls the appropriate API service
3. API service makes HTTP request to the backend
4. NestJS controller receives the request and routes it to the proper service
5. Service processes the request, interacting with repositories as needed
6. Repository performs database operations
7. Response flows back through the chain to update the UI

## Scalability Considerations

- The modular architecture allows for easy addition of new features
- The backend can be horizontally scaled by deploying multiple instances
- Database operations can be optimized with indexes and query caching
- Consider implementing WebSockets for real-time updates in future versions 