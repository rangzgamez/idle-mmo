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
exports.CharactersController = void 0;
const common_1 = require("@nestjs/common");
const characters_service_1 = require("./characters.service");
const create_character_dto_1 = require("./dto/create-character.dto");
const update_character_dto_1 = require("./dto/update-character.dto");
const create_item_dto_1 = require("../items/dto/create-item.dto");
let CharactersController = class CharactersController {
    constructor(charactersService) {
        this.charactersService = charactersService;
    }
    create(createCharacterDto) {
        return this.charactersService.create(createCharacterDto);
    }
    createTestCharacter(userId) {
        const testCharacter = {
            name: 'Test Character',
            class: 'Fighter',
            userId: userId
        };
        return this.charactersService.createWithDefaultItems(testCharacter);
    }
    findAll() {
        return this.charactersService.findAll();
    }
    findByUser(userId) {
        return this.charactersService.findByUser(userId);
    }
    findOne(id) {
        return this.charactersService.findOne(id);
    }
    update(id, updateCharacterDto) {
        return this.charactersService.update(id, updateCharacterDto);
    }
    remove(id) {
        return this.charactersService.remove(id);
    }
    getCharacterItems(id) {
        return this.charactersService.getCharacterItems(id);
    }
    createItemForCharacter(id, createItemDto) {
        return this.charactersService.createItemForCharacter(id, createItemDto);
    }
    equipItem(id, itemId) {
        return this.charactersService.equipItem(id, itemId);
    }
    unequipItem(id, itemId) {
        return this.charactersService.unequipItem(id, itemId);
    }
    updateCharacterStats() {
        return this.charactersService.updateCharacterStats();
    }
};
exports.CharactersController = CharactersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_character_dto_1.CreateCharacterDto]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('test/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "createTestCharacter", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_character_dto_1.UpdateCharacterDto]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "getCharacterItems", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_item_dto_1.CreateItemDto]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "createItemForCharacter", null);
__decorate([
    (0, common_1.Post)(':id/equip/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "equipItem", null);
__decorate([
    (0, common_1.Post)(':id/unequip/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CharactersController.prototype, "unequipItem", null);
__decorate([
    (0, common_1.Post)('update-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CharactersController.prototype, "updateCharacterStats", null);
exports.CharactersController = CharactersController = __decorate([
    (0, common_1.Controller)('characters'),
    __metadata("design:paramtypes", [characters_service_1.CharactersService])
], CharactersController);
//# sourceMappingURL=characters.controller.js.map