"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharactersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("./entities/character.entity");
const users_service_1 = require("../users/users.service");
const items_service_1 = require("../items/items.service");
let CharactersService = class CharactersService {
    constructor(charactersRepository, usersService, itemsService) {
        this.charactersRepository = charactersRepository;
        this.usersService = usersService;
        this.itemsService = itemsService;
    }
    async create(createCharacterDto) {
        const user = await this.usersService.findOne(createCharacterDto.userId);
        const character = this.charactersRepository.create(Object.assign(Object.assign({}, createCharacterDto), { user }));
        return this.charactersRepository.save(character);
    }
    async createWithDefaultItems(createCharacterDto) {
        const character = await this.create(createCharacterDto);
        const defaultItems = [
            {
                name: 'Wooden Sword',
                description: 'A basic wooden sword for beginners.',
                type: 'Weapon',
                rarity: 'Common',
                level: 1,
                stats: { attack: 3 },
                value: 10
            },
            {
                name: 'Leather Vest',
                description: 'Basic leather protection.',
                type: 'Armor',
                rarity: 'Common',
                level: 1,
                stats: { defense: 2 },
                value: 15
            },
            {
                name: 'Health Potion',
                description: 'Restores 30 HP when used.',
                type: 'Consumable',
                rarity: 'Common',
                level: 1,
                value: 5
            }
        ];
        for (const itemData of defaultItems) {
            const item = await this.itemsService.create(itemData);
            if (!character.items) {
                character.items = [];
            }
            character.items.push(item);
        }
        if (!character.equipment) {
            character.equipment = {};
        }
        const weapon = character.items.find(item => item.type === 'Weapon');
        const armor = character.items.find(item => item.type === 'Armor');
        if (weapon) {
            character.equipment.weapon = weapon.id;
        }
        if (armor) {
            character.equipment.armor = armor.id;
        }
        return this.charactersRepository.save(character);
    }
    findAll() {
        return this.charactersRepository.find();
    }
    async findByUser(userId) {
        const user = await this.usersService.findOne(userId);
        return this.charactersRepository.find({ where: { user: { id: user.id } } });
    }
    async findOne(id) {
        const character = await this.charactersRepository.findOne({
            where: { id },
            relations: ['user', 'items']
        });
        if (!character) {
            throw new common_1.NotFoundException(`Character with ID ${id} not found`);
        }
        return character;
    }
    async update(id, updateCharacterDto) {
        const character = await this.findOne(id);
        Object.assign(character, updateCharacterDto);
        return this.charactersRepository.save(character);
    }
    async remove(id) {
        const result = await this.charactersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Character with ID ${id} not found`);
        }
    }
    async getCharacterItems(characterId) {
        const character = await this.findOne(characterId);
        if (character.equipment) {
            const items = [...character.items];
            for (const slotKey of Object.keys(character.equipment)) {
                const equippedItemId = character.equipment[slotKey];
                if (equippedItemId) {
                    const item = items.find(i => i.id === equippedItemId);
                    if (item) {
                        item.equipped = true;
                        item.equippedBy = characterId;
                    }
                }
            }
            return items;
        }
        return character.items;
    }
    async createItemForCharacter(characterId, createItemDto) {
        const character = await this.findOne(characterId);
        const item = await this.itemsService.create(createItemDto);
        if (!character.items) {
            character.items = [];
        }
        character.items.push(item);
        await this.charactersRepository.save(character);
        return item;
    }
    async equipItem(characterId, itemId) {
        const character = await this.findOne(characterId);
        const item = await this.itemsService.findOne(itemId);
        const hasItem = character.items.some(i => i.id === itemId);
        if (!hasItem) {
            throw new common_1.BadRequestException(`Character does not own item with ID ${itemId}`);
        }
        if (!['Weapon', 'Armor', 'Accessory'].includes(item.type)) {
            throw new common_1.BadRequestException(`Item of type ${item.type} cannot be equipped`);
        }
        const equippedItemIndex = character.items.findIndex(i => i.type === item.type &&
            character.equipment &&
            character.equipment[this.getEquipmentSlot(i.type)] === i.id);
        if (!character.equipment) {
            character.equipment = {};
        }
        if (equippedItemIndex >= 0) {
            const equippedItem = character.items[equippedItemIndex];
            character.equipment[this.getEquipmentSlot(equippedItem.type)] = undefined;
        }
        character.equipment[this.getEquipmentSlot(item.type)] = item.id;
        return this.charactersRepository.save(character);
    }
    async unequipItem(characterId, itemId) {
        const character = await this.findOne(characterId);
        const item = await this.itemsService.findOne(itemId);
        const hasItem = character.items.some(i => i.id === itemId);
        if (!hasItem) {
            throw new common_1.BadRequestException(`Character does not own item with ID ${itemId}`);
        }
        if (!character.equipment || character.equipment[this.getEquipmentSlot(item.type)] !== item.id) {
            throw new common_1.BadRequestException(`Item with ID ${itemId} is not equipped`);
        }
        character.equipment[this.getEquipmentSlot(item.type)] = undefined;
        return this.charactersRepository.save(character);
    }
    getEquipmentSlot(itemType) {
        switch (itemType) {
            case 'Weapon': return 'weapon';
            case 'Armor': return 'armor';
            case 'Accessory': return 'accessory';
            default: throw new common_1.BadRequestException(`Item of type ${itemType} does not have an equipment slot`);
        }
    }
    async updateCharacterStats() {
        const characters = await this.charactersRepository.find();
        let updatedCount = 0;
        const classStats = {
            'Fighter': { baseHp: 150, baseMp: 30, hpPerLevel: 20, mpPerLevel: 5 },
            'Priest': { baseHp: 100, baseMp: 120, hpPerLevel: 10, mpPerLevel: 25 },
            'Rogue': { baseHp: 120, baseMp: 50, hpPerLevel: 15, mpPerLevel: 10 },
            'Archer': { baseHp: 110, baseMp: 60, hpPerLevel: 12, mpPerLevel: 15 },
            'Wizard': { baseHp: 90, baseMp: 150, hpPerLevel: 8, mpPerLevel: 30 }
        };
        for (const character of characters) {
            const stats = classStats[character.class];
            if (!stats) {
                console.warn(`Unknown character class: ${character.class}`);
                continue;
            }
            const expectedMaxHp = stats.baseHp + (stats.hpPerLevel * (character.level - 1));
            const expectedMaxMp = stats.baseMp + (stats.mpPerLevel * (character.level - 1));
            if (character.maxHp !== expectedMaxHp || character.maxMp !== expectedMaxMp) {
                character.maxHp = expectedMaxHp;
                character.hp = expectedMaxHp;
                character.maxMp = expectedMaxMp;
                character.mp = expectedMaxMp;
                await this.charactersRepository.save(character);
                updatedCount++;
            }
        }
        return {
            updated: updatedCount,
            characters
        };
    }
};
exports.CharactersService = CharactersService;
exports.CharactersService = CharactersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        items_service_1.ItemsService])
], CharactersService);
//# sourceMappingURL=characters.service.js.map