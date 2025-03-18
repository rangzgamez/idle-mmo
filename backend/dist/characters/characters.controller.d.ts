import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Character } from './entities/character.entity';
import { Item } from '../items/entities/item.entity';
import { CreateItemDto } from '../items/dto/create-item.dto';
export declare class CharactersController {
    private readonly charactersService;
    constructor(charactersService: CharactersService);
    create(createCharacterDto: CreateCharacterDto): Promise<Character>;
    createTestCharacter(userId: string): Promise<Character>;
    findAll(): Promise<Character[]>;
    findByUser(userId: string): Promise<Character[]>;
    findOne(id: string): Promise<Character>;
    update(id: string, updateCharacterDto: UpdateCharacterDto): Promise<Character>;
    remove(id: string): Promise<void>;
    getCharacterItems(id: string): Promise<Item[]>;
    createItemForCharacter(id: string, createItemDto: CreateItemDto): Promise<Item>;
    equipItem(id: string, itemId: string): Promise<Character>;
    unequipItem(id: string, itemId: string): Promise<Character>;
    updateCharacterStats(): Promise<{
        updated: number;
        characters: Character[];
    }>;
}
