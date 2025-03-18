import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Character } from './entities/character.entity';
import { Item } from '../items/entities/item.entity';
import { CreateItemDto } from '../items/dto/create-item.dto';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  create(@Body() createCharacterDto: CreateCharacterDto): Promise<Character> {
    return this.charactersService.create(createCharacterDto);
  }

  @Post('test/:userId')
  createTestCharacter(@Param('userId') userId: string): Promise<Character> {
    const testCharacter: CreateCharacterDto = {
      name: 'Test Character',
      class: 'Fighter',
      userId: userId
    };
    return this.charactersService.createWithDefaultItems(testCharacter);
  }

  @Get()
  findAll(): Promise<Character[]> {
    return this.charactersService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Character[]> {
    return this.charactersService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Character> {
    return this.charactersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
  ): Promise<Character> {
    return this.charactersService.update(id, updateCharacterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.charactersService.remove(id);
  }
  
  @Get(':id/items')
  getCharacterItems(@Param('id') id: string): Promise<Item[]> {
    return this.charactersService.getCharacterItems(id);
  }
  
  @Post(':id/items')
  createItemForCharacter(
    @Param('id') id: string, 
    @Body() createItemDto: CreateItemDto
  ): Promise<Item> {
    return this.charactersService.createItemForCharacter(id, createItemDto);
  }
  
  @Post(':id/equip/:itemId')
  equipItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<Character> {
    return this.charactersService.equipItem(id, itemId);
  }
  
  @Post(':id/unequip/:itemId')
  unequipItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<Character> {
    return this.charactersService.unequipItem(id, itemId);
  }
  
  @Post('update-stats')
  updateCharacterStats() {
    return this.charactersService.updateCharacterStats();
  }
} 