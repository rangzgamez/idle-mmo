import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { UsersService } from '../users/users.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Item } from '../items/entities/item.entity';
import { ItemsService } from '../items/items.service';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    private usersService: UsersService,
    private itemsService: ItemsService,
  ) {}

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    const user = await this.usersService.findOne(createCharacterDto.userId);
    
    const character = this.charactersRepository.create({
      ...createCharacterDto,
      user
    });
    
    return this.charactersRepository.save(character);
  }

  async createWithDefaultItems(createCharacterDto: CreateCharacterDto): Promise<Character> {
    // Create the character first
    const character = await this.create(createCharacterDto);
    
    // Create default items
    const defaultItems = [
      {
        name: 'Wooden Sword',
        description: 'A basic wooden sword for beginners.',
        type: 'Weapon' as 'Weapon',
        rarity: 'Common' as 'Common',
        level: 1,
        stats: { attack: 3 },
        value: 10
      },
      {
        name: 'Leather Vest',
        description: 'Basic leather protection.',
        type: 'Armor' as 'Armor',
        rarity: 'Common' as 'Common',
        level: 1,
        stats: { defense: 2 },
        value: 15
      },
      {
        name: 'Health Potion',
        description: 'Restores 30 HP when used.',
        type: 'Consumable' as 'Consumable',
        rarity: 'Common' as 'Common',
        level: 1,
        value: 5
      }
    ];
    
    // Add items to character's inventory
    for (const itemData of defaultItems) {
      const item = await this.itemsService.create(itemData);
      
      // Add item to character
      if (!character.items) {
        character.items = [];
      }
      character.items.push(item);
    }
    
    // Equip the weapon and armor
    if (!character.equipment) {
      character.equipment = {};
    }
    
    // Find the ids of the newly created weapon and armor
    const weapon = character.items.find(item => item.type === 'Weapon');
    const armor = character.items.find(item => item.type === 'Armor');
    
    if (weapon) {
      character.equipment.weapon = weapon.id;
    }
    
    if (armor) {
      character.equipment.armor = armor.id;
    }
    
    // Save the updated character
    return this.charactersRepository.save(character);
  }

  findAll(): Promise<Character[]> {
    return this.charactersRepository.find();
  }

  async findByUser(userId: string): Promise<Character[]> {
    const user = await this.usersService.findOne(userId);
    return this.charactersRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string): Promise<Character> {
    const character = await this.charactersRepository.findOne({ 
      where: { id },
      relations: ['user', 'items']
    });
    
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    
    return character;
  }

  async update(id: string, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    const character = await this.findOne(id);
    
    // Update character properties
    Object.assign(character, updateCharacterDto);
    
    return this.charactersRepository.save(character);
  }

  async remove(id: string): Promise<void> {
    const result = await this.charactersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
  }
  
  async getCharacterItems(characterId: string): Promise<Item[]> {
    const character = await this.findOne(characterId);
    
    // If character has equipment, mark items as equipped
    if (character.equipment) {
      const items = [...character.items]; // Create a copy to avoid modifying the original
      
      // For each equipped item, set the equippedBy property
      for (const slotKey of Object.keys(character.equipment)) {
        const equippedItemId = character.equipment[slotKey];
        if (equippedItemId) {
          const item = items.find(i => i.id === equippedItemId);
          if (item) {
            // Add equipped status and equippedBy (these will be used by the frontend)
            (item as any).equipped = true;
            (item as any).equippedBy = characterId;
          }
        }
      }
      
      return items;
    }
    
    return character.items;
  }
  
  async createItemForCharacter(characterId: string, createItemDto: any): Promise<Item> {
    const character = await this.findOne(characterId);
    
    // Create the item
    const item = await this.itemsService.create(createItemDto);
    
    // Add the item to the character's inventory
    if (!character.items) {
      character.items = [];
    }
    character.items.push(item);
    
    // Save the character to update the relationship
    await this.charactersRepository.save(character);
    
    return item;
  }
  
  async equipItem(characterId: string, itemId: string): Promise<Character> {
    const character = await this.findOne(characterId);
    const item = await this.itemsService.findOne(itemId);
    
    // Check if item exists in character's inventory
    const hasItem = character.items.some(i => i.id === itemId);
    if (!hasItem) {
      throw new BadRequestException(`Character does not own item with ID ${itemId}`);
    }
    
    // Check if item is equippable (weapon, armor, accessory)
    if (!['Weapon', 'Armor', 'Accessory'].includes(item.type)) {
      throw new BadRequestException(`Item of type ${item.type} cannot be equipped`);
    }
    
    // Check if character already has an item of this type equipped
    const equippedItemIndex = character.items.findIndex(i => 
      i.type === item.type && 
      character.equipment && 
      character.equipment[this.getEquipmentSlot(i.type)] === i.id
    );
    
    // Initialize equipment if not exists
    if (!character.equipment) {
      character.equipment = {};
    }
    
    // Unequip previous item of same type if exists
    if (equippedItemIndex >= 0) {
      const equippedItem = character.items[equippedItemIndex];
      character.equipment[this.getEquipmentSlot(equippedItem.type)] = undefined;
    }
    
    // Equip new item
    character.equipment[this.getEquipmentSlot(item.type)] = item.id;
    
    return this.charactersRepository.save(character);
  }
  
  async unequipItem(characterId: string, itemId: string): Promise<Character> {
    const character = await this.findOne(characterId);
    const item = await this.itemsService.findOne(itemId);
    
    // Check if item exists in character's inventory
    const hasItem = character.items.some(i => i.id === itemId);
    if (!hasItem) {
      throw new BadRequestException(`Character does not own item with ID ${itemId}`);
    }
    
    // Check if item is actually equipped
    if (!character.equipment || character.equipment[this.getEquipmentSlot(item.type)] !== item.id) {
      throw new BadRequestException(`Item with ID ${itemId} is not equipped`);
    }
    
    // Unequip item
    character.equipment[this.getEquipmentSlot(item.type)] = undefined;
    
    return this.charactersRepository.save(character);
  }
  
  private getEquipmentSlot(itemType: string): string {
    switch (itemType) {
      case 'Weapon': return 'weapon';
      case 'Armor': return 'armor';
      case 'Accessory': return 'accessory';
      default: throw new BadRequestException(`Item of type ${itemType} does not have an equipment slot`);
    }
  }

  async updateCharacterStats(): Promise<{ updated: number, characters: Character[] }> {
    // Get all characters
    const characters = await this.charactersRepository.find();
    let updatedCount = 0;
    
    // HP and MP stat modifiers for each class
    const classStats = {
      'Fighter': { baseHp: 150, baseMp: 30, hpPerLevel: 20, mpPerLevel: 5 },
      'Priest': { baseHp: 100, baseMp: 120, hpPerLevel: 10, mpPerLevel: 25 },
      'Rogue': { baseHp: 120, baseMp: 50, hpPerLevel: 15, mpPerLevel: 10 },
      'Archer': { baseHp: 110, baseMp: 60, hpPerLevel: 12, mpPerLevel: 15 },
      'Wizard': { baseHp: 90, baseMp: 150, hpPerLevel: 8, mpPerLevel: 30 }
    };
    
    // Loop through each character
    for (const character of characters) {
      // Get the stat modifiers for this character's class
      const stats = classStats[character.class];
      
      if (!stats) {
        console.warn(`Unknown character class: ${character.class}`);
        continue;
      }
      
      // Calculate what the HP and MP should be at this level
      const expectedMaxHp = stats.baseHp + (stats.hpPerLevel * (character.level - 1));
      const expectedMaxMp = stats.baseMp + (stats.mpPerLevel * (character.level - 1));
      
      // Only update if different from current values
      if (character.maxHp !== expectedMaxHp || character.maxMp !== expectedMaxMp) {
        // Update the character
        character.maxHp = expectedMaxHp;
        character.hp = expectedMaxHp; // Set current HP to max
        character.maxMp = expectedMaxMp;
        character.mp = expectedMaxMp; // Set current MP to max
        
        await this.charactersRepository.save(character);
        updatedCount++;
      }
    }
    
    return { 
      updated: updatedCount,
      characters
    };
  }
} 