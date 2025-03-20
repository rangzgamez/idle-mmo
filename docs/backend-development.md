# Backend Development Guide

This guide explains how to work with the backend codebase of the Idle MMO game.

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite (via TypeORM)
- **Authentication**: JWT
- **Package Manager**: npm

## Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Root module
│   ├── controllers/            # API endpoints
│   ├── services/               # Business logic
│   ├── entities/               # TypeORM entities
│   ├── repositories/           # Database access
│   ├── dto/                    # Data Transfer Objects
│   ├── middleware/             # HTTP middleware
│   └── utils/                  # Utility functions
├── idlemmo.sqlite              # SQLite database
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
└── nest-cli.json               # NestJS configuration
```

## Getting Started

1. **Install Dependencies**

```bash
cd backend
npm install
```

2. **Start Development Server**

```bash
npm run start:dev
```

This will start the development server at http://localhost:3000 with hot-reloading enabled.

3. **Build for Production**

```bash
npm run build
```

This will create a production-ready build in the `dist` folder.

## Database Management

The game uses SQLite with TypeORM for database management.

### Entity Structure

Entities are defined in the `src/entities` directory and represent database tables:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
```

### Running Migrations

To create a new migration:

```bash
npm run typeorm:migration:generate -- -n MigrationName
```

To run migrations:

```bash
npm run typeorm:migration:run
```

## Creating API Endpoints

### Controllers

Controllers handle HTTP requests and are defined in the `src/controllers` directory:

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CharactersService } from '../services/characters.service';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.charactersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.charactersService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCharacterDto: CreateCharacterDto) {
    return this.charactersService.create(createCharacterDto);
  }
}
```

### Services

Services contain business logic and are defined in the `src/services` directory:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { CreateCharacterDto } from '../dto/create-character.dto';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async findAll(): Promise<Character[]> {
    return this.characterRepository.find();
  }

  async findOne(id: number): Promise<Character> {
    const character = await this.characterRepository.findOne({ where: { id } });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return character;
  }

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    const character = this.characterRepository.create(createCharacterDto);
    return this.characterRepository.save(character);
  }
}
```

### DTOs

Data Transfer Objects validate incoming data and are defined in the `src/dto` directory:

```typescript
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(10)
  class: number;
}
```

## Authentication

The game uses JWT for authentication:

### Implementation

1. User login endpoint validates credentials and returns a JWT token
2. Subsequent requests include the token in the Authorization header
3. JwtAuthGuard validates the token before allowing access to protected endpoints

### Usage

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

## Game Mechanics Implementation

### Combat System

Combat calculations are handled in the `CombatService`:

```typescript
@Injectable()
export class CombatService {
  calculateDamage(attacker: Character, defender: Character): number {
    // Implement damage calculation based on stats, equipment, etc.
    const baseDamage = attacker.attack - defender.defense;
    return Math.max(1, baseDamage);
  }
  
  // Other combat methods...
}
```

### Progression System

Experience and leveling are managed in the `ProgressionService`:

```typescript
@Injectable()
export class ProgressionService {
  calculateExperienceGain(character: Character, enemy: Enemy): number {
    // Implement XP calculation logic
    return enemy.baseXp * (1 + enemy.level / 10);
  }
  
  checkLevelUp(character: Character): boolean {
    // Implement level up logic
    const xpNeeded = this.getXpForNextLevel(character.level);
    return character.experience >= xpNeeded;
  }
  
  // Other progression methods...
}
```

## Error Handling

Use NestJS exception filters for consistent error handling:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
  }
}
```

## Testing

### Unit Testing

```bash
npm run test
```

Example test for a service:

```typescript
import { Test } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Character } from '../entities/character.entity';

describe('CharactersService', () => {
  let service: CharactersService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<CharactersService>(CharactersService);
  });

  describe('findAll', () => {
    it('should return an array of characters', async () => {
      const result = ['test'];
      mockRepository.find.mockResolvedValue(result);
      expect(await service.findAll()).toBe(result);
    });
  });
});
```

### E2E Testing

```bash
npm run test:e2e
```

## Performance Considerations

1. **Query Optimization**
   - Use TypeORM's query builder for complex queries
   - Add indexes to frequently queried fields

2. **Caching**
   - Implement caching for frequently accessed data
   - Use NestJS's built-in cache manager

3. **Rate Limiting**
   - Implement rate limiting for public endpoints
   - Use the `@nestjs/throttler` package

## Adding New Features

When adding new game features:

1. **Define entities** - Create or update database entities
2. **Create DTOs** - Define data validation rules
3. **Implement service** - Add business logic
4. **Create controller** - Expose API endpoints
5. **Update module** - Register new components
6. **Write tests** - Ensure functionality works as expected 