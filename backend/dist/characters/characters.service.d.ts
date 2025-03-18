import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { UsersService } from '../users/users.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Item } from '../items/entities/item.entity';
import { ItemsService } from '../items/items.service';
export declare class CharactersService {
    private charactersRepository;
    private usersService;
    private itemsService;
    constructor(charactersRepository: Repository<Character>, usersService: UsersService, itemsService: ItemsService);
    create(createCharacterDto: CreateCharacterDto): Promise<Character>;
    createWithDefaultItems(createCharacterDto: CreateCharacterDto): Promise<Character>;
    findAll(): Promise<Character[]>;
    findByUser(userId: string): Promise<Character[]>;
    findOne(id: string): Promise<Character>;
    update(id: string, updateCharacterDto: UpdateCharacterDto): Promise<Character>;
    remove(id: string): Promise<void>;
    getCharacterItems(characterId: string): Promise<Item[]>;
    createItemForCharacter(characterId: string, createItemDto: any): Promise<Item>;
    equipItem(characterId: string, itemId: string): Promise<Character>;
    unequipItem(characterId: string, itemId: string): Promise<Character>;
    private getEquipmentSlot;
    updateCharacterStats(): Promise<{
        updated: number;
        characters: Character[];
    }>;
}
