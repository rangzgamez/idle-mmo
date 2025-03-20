import Phaser from 'phaser';
import { Character } from '../models/Character';
import { Item, ItemType } from '../models/Item';
import { apiService } from '../services/api.service';

export class InventoryScene extends Phaser.Scene {
    private characters: Character[] = [];
    private characterItems: Map<string, Item[]> = new Map(); // Items organized by character ID
    private selectedCharacterId: string | null = null;
    private inventoryContainer!: Phaser.GameObjects.Container; // Use definite assignment assertion
    private characterEquipmentSlots: Map<string, Record<string, Phaser.GameObjects.Container>> = new Map();
    private pendingOperations: Set<string> = new Set();
    private characterSelectors: Phaser.GameObjects.Container[] = [];
    
    constructor() {
        super({ key: 'InventoryScene' });
    }
    
    preload(): void {
        // Check if item textures are loaded, if not load them
        if (!this.textures.exists('sword')) {
            this.load.image('sword', 'assets/images/items/sword.png');
        }
        if (!this.textures.exists('armor')) {
            // Use staff image as placeholder for armor
            this.load.image('armor', 'assets/images/items/staff.png');
        }
        if (!this.textures.exists('ring')) {
            // Use bow image as placeholder for accessory
            this.load.image('ring', 'assets/images/items/bow.png');
        }
        if (!this.textures.exists('item')) {
            // Generic item
            this.load.image('item', 'assets/images/items/sword.png');
        }
    }
    
    create(): void {
        console.log('InventoryScene: create');
        
        // Create UI for inventory
        this.createUI();
        
        // Load player characters
        this.loadCharacters();
    }
    
    private createUI(): void {
        // Main title
        this.add.text(10, 10, 'Character Equipment & Inventory', {
            fontSize: '20px',
            color: '#ffffff'
        });
        
        // Create inventory container
        this.inventoryContainer = this.add.container(0, 0);
        
        // Set up drag events
        this.input.on('dragstart', this.handleDragStart, this);
        this.input.on('drag', this.handleDrag, this);
        this.input.on('dragend', this.handleDragEnd, this);
        
        // Add close button
        const closeButton = this.add.text(this.cameras.main.width - 30, 20, 'X', {
            fontSize: '24px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
              this.scene.stop();
              this.scene.resume('WorldScene'); // Make sure to update this to your main scene key if different
          });
    }
    
    private async loadCharacters(): Promise<void> {
        try {
            // Fetch characters from API
            const userId = localStorage.getItem('userId') || '';
            this.characters = await apiService.getCharacters(userId);
            console.log(`Loaded ${this.characters.length} characters`);
            
            if (this.characters.length > 0) {
                // Select the first character by default
                this.selectedCharacterId = this.characters[0].id;
                
                // Display character selectors
                this.createCharacterSelectors();
                
                // Display character equipment slots
                this.displayCharacterEquipment();
                
                // Load each character's items
                await this.loadAllCharacterItems();
            }
        } catch (error) {
            console.error('Failed to load characters:', error);
        }
    }
    
    private createCharacterSelectors(): void {
        const startX = 100;
        const y = 50;
        const spacing = 120;
        
        // Clear existing selectors
        this.characterSelectors.forEach(selector => selector.destroy());
        this.characterSelectors = [];
        
        // Create a selector for each character
        this.characters.forEach((character, index) => {
            const x = startX + (index * spacing);
            
            // Create container for the character selector
            const container = this.add.container(x, y);
            
            // Character portrait background
            const bg = this.add.circle(0, 0, 25, 0x333333);
            bg.setStrokeStyle(2, character.id === this.selectedCharacterId ? 0xffff00 : 0x666666);
            bg.setInteractive({ useHandCursor: true });
            container.add(bg);
            
            // Character portrait (using first letter of name as placeholder)
            const portrait = this.add.text(0, 0, character.name.charAt(0).toUpperCase(), {
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add(portrait);
            
            // Character name
            const nameText = this.add.text(0, 35, character.name, {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add(nameText);
            
            // Make selector interactive
            bg.on('pointerdown', () => {
                this.selectCharacter(character.id);
            });
            
            this.characterSelectors.push(container);
        });
    }
    
    private selectCharacter(characterId: string): void {
        if (this.selectedCharacterId === characterId) return;
        
        // Update selected character
        this.selectedCharacterId = characterId;
        
        // Update the UI to reflect the selection
        this.updateCharacterSelectionUI();
        
        // Display the selected character's items
        this.displayInventory();
    }
    
    private updateCharacterSelectionUI(): void {
        // Update character selector visuals
        this.characterSelectors.forEach((selector, index) => {
            const bg = selector.getAt(0) as Phaser.GameObjects.Shape;
            const characterId = this.characters[index].id;
            bg.setStrokeStyle(2, characterId === this.selectedCharacterId ? 0xffff00 : 0x666666);
        });
        
        // Highlight the selected character's equipment
        this.characters.forEach(character => {
            const slots = this.characterEquipmentSlots.get(character.id);
            if (slots) {
                Object.values(slots).forEach(container => {
                    const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
                    bg.setStrokeStyle(2, character.id === this.selectedCharacterId ? 0xffff00 : 0x666666);
                });
            }
        });
    }
    
    private displayCharacterEquipment(): void {
        // Clear any existing equipment UI
        this.characterEquipmentSlots.clear();
        
        const startY = 120;
        const spacing = 120;
        
        // Display each character's equipment
        this.characters.forEach((character, index) => {
            const y = startY + (index * spacing);
            
            // Character name
            this.add.text(10, y, character.name, {
                fontSize: '16px',
                color: '#ffffff'
            });
            
            // Equipment slots
            const slotTypes = ['weapon', 'armor', 'accessory'];
            const slotX = [120, 200, 280];
            
            // Create equipment slots for this character
            const characterSlots: Record<string, Phaser.GameObjects.Container> = {};
            
            slotTypes.forEach((slotType, i) => {
                const container = this.createEquipmentSlot(slotX[i], y + 30, slotType, character.id);
                characterSlots[slotType] = container;
                
                // Add slot label
                this.add.text(slotX[i], y + 10, slotType.charAt(0).toUpperCase() + slotType.slice(1), {
                    fontSize: '12px',
                    color: '#cccccc'
                }).setOrigin(0.5, 0);
            });
            
            // Store the character's slots
            this.characterEquipmentSlots.set(character.id, characterSlots);
        });
    }
    
    private createEquipmentSlot(x: number, y: number, slotType: string, characterId: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        // Slot background
        const slotBg = this.add.rectangle(0, 0, 40, 40, 0x333333);
        slotBg.setStrokeStyle(1, 0xcccccc);
        
        // Add to container
        container.add(slotBg);
        
        // Set data for drop handling
        container.setData('slotType', slotType);
        container.setData('characterId', characterId);
        slotBg.setData('slotType', slotType);
        slotBg.setData('characterId', characterId);
        
        return container;
    }
    
    private async loadAllCharacterItems(): Promise<void> {
        try {
            // Clear existing items
            this.characterItems.clear();
            
            // Load items for each character
            for (const character of this.characters) {
                const items = await apiService.getCharacterItems(character.id);
                console.log(`Loaded ${items.length} items for character ${character.name}`);
                
                // Process items to ensure equipped status is correctly set
                items.forEach(item => {
                    if (character.equipment) {
                        if (character.equipment.weapon === item.id) {
                            item.equipped = true;
                            item.equippedBy = character.id;
                            item.equippedSlot = 'Weapon';
                        } else if (character.equipment.armor === item.id) {
                            item.equipped = true;
                            item.equippedBy = character.id;
                            item.equippedSlot = 'Armor';
                        } else if (character.equipment.accessory === item.id) {
                            item.equipped = true;
                            item.equippedBy = character.id;
                            item.equippedSlot = 'Accessory';
                        }
                    }
                });
                
                // Store items for this character
                this.characterItems.set(character.id, items);
            }
            
            // Update equipped items display
            this.updateEquippedItems();
            
            // Display inventory for selected character
            this.displayInventory();
            
        } catch (error) {
            console.error('Failed to load character items:', error);
        }
    }
    
    private updateEquippedItems(): void {
        // Clear existing equipped items
        for (const [characterId, slots] of this.characterEquipmentSlots.entries()) {
            for (const container of Object.values(slots)) {
                // Remove all but the first child (background)
                while (container.length > 1) {
                    container.removeAt(1, true);
                }
            }
        }
        
        // Place equipped items in their respective slots
        for (const [characterId, items] of this.characterItems.entries()) {
            const equippedItems = items.filter(item => item.equipped);
            
            for (const item of equippedItems) {
                const characterSlots = this.characterEquipmentSlots.get(characterId);
                if (characterSlots && item.equippedSlot) {
                    const slotType = this.getSlotTypeFromItemType(item.type);
                    const slotContainer = characterSlots[slotType];
                    
                    if (slotContainer) {
                        // Create item sprite in the slot
                        const itemSprite = this.add.sprite(0, 0, this.getItemTexture(item.type));
                        itemSprite.setDisplaySize(32, 32);
                        
                        // Set item data for drag operations
                        itemSprite.setData('item', item);
                        itemSprite.setData('type', item.type);
                        itemSprite.setData('slotType', slotType);
                        itemSprite.setData('characterId', characterId);
                        
                        // Make item interactive for drag and drop
                        itemSprite.setInteractive();
                        this.input.setDraggable(itemSprite);
                        
                        // Add to slot container
                        slotContainer.add(itemSprite);
                    }
                }
            }
        }
    }
    
    private displayInventory(): void {
        // Create the container if it hasn't been created yet
        if (!this.inventoryContainer) {
            this.inventoryContainer = this.add.container(0, 0);
        } else {
            // Clear existing content
            this.inventoryContainer.removeAll(true);
        }
        
        // If no character is selected, return
        if (!this.selectedCharacterId) return;
        
        // Get the selected character's items
        const characterItems = this.characterItems.get(this.selectedCharacterId) || [];
        const unequippedItems = characterItems.filter(item => !item.equipped);
        
        console.log(`Displaying ${unequippedItems.length} items for character ${this.selectedCharacterId}`);
        
        // Create a grid layout for the items
        const startX = 400;
        const startY = 120;
        const itemSize = 40;
        const padding = 5;
        const itemsPerRow = 6;
        
        // Add inventory title
        this.add.text(startX, startY - 40, 'Character Inventory', {
            fontSize: '16px',
            color: '#ffffff'
        });
        
        // Add items to the inventory
        unequippedItems.forEach((item, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            const x = startX + col * (itemSize + padding);
            const y = startY + row * (itemSize + padding);
            
            // Create item slot
            const slotBg = this.add.rectangle(x, y, itemSize, itemSize, 0x333333);
            slotBg.setStrokeStyle(1, 0xcccccc);
            slotBg.setOrigin(0);
            slotBg.setData('slotType', 'inventory');
            slotBg.setData('characterId', this.selectedCharacterId);
            
            // Create item sprite
            const itemSprite = this.add.sprite(x + itemSize/2, y + itemSize/2, this.getItemTexture(item.type));
            itemSprite.setDisplaySize(32, 32);
            
            // Set item data
            itemSprite.setData('item', item);
            itemSprite.setData('type', item.type);
            itemSprite.setData('slotType', 'inventory');
            itemSprite.setData('characterId', this.selectedCharacterId);
            
            // Make item interactive for drag and drop
            itemSprite.setInteractive();
            this.input.setDraggable(itemSprite);
            
            // Add to the inventory container
            this.inventoryContainer.add(slotBg);
            this.inventoryContainer.add(itemSprite);
        });
    }
    
    // Drag handlers
    private handleDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite): void {
        // Store original position
        gameObject.setData('originalX', gameObject.x);
        gameObject.setData('originalY', gameObject.y);
        
        // Visual feedback
        gameObject.setDepth(100);
        gameObject.setScale(1.1);
    }
    
    private handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number): void {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }
    
    private handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite): void {
        // Reset visual state
        gameObject.setDepth(0);
        gameObject.setScale(1);
        
        // Get item data
        const item = gameObject.getData('item') as Item;
        if (!item) {
            this.resetDraggedItem(gameObject);
            return;
        }
        
        // Check if operation already in progress
        if (this.pendingOperations.has(item.id)) {
            console.log(`Operation in progress for item ${item.id}, ignoring drop`);
            this.resetDraggedItem(gameObject);
            return;
        }
        
        // Find what we dropped on
        const dropZone = this.findDropZone(pointer.x, pointer.y);
        if (!dropZone) {
            console.log('No valid drop zone found');
            this.resetDraggedItem(gameObject);
            return;
        }
        
        // Get drop zone data
        const targetSlotType = dropZone.getData('slotType') as string;
        const targetCharacterId = dropZone.getData('characterId') as string;
        const sourceSlotType = gameObject.getData('slotType') as string;
        
        console.log(`Item ${item.id} dropped on ${targetSlotType} slot for character ${targetCharacterId}`);
        
        // Validate the drop
        if (targetSlotType !== 'inventory' && this.getSlotTypeFromItemType(item.type) !== targetSlotType) {
            console.log(`Item type ${item.type} doesn't match slot type ${targetSlotType}`);
            this.resetDraggedItem(gameObject);
            return;
        }
        
        // Mark operation as pending
        this.pendingOperations.add(item.id);
        
        // Handle different drop scenarios
        if (item.equipped) {
            // Item is currently equipped
            const currentCharacterId = item.equippedBy;
            
            if (targetSlotType === 'inventory') {
                // Unequip item to inventory
                console.log(`Unequipping item ${item.id} from character ${currentCharacterId}`);
                this.processUnequip(item, currentCharacterId as string);
            } else if (currentCharacterId !== targetCharacterId) {
                // Transfer item to another character
                console.log(`Transferring item ${item.id} from character ${currentCharacterId} to ${targetCharacterId}`);
                this.processItemTransfer(item, currentCharacterId as string, targetCharacterId);
            } else {
                // Dropped on same slot, do nothing
                console.log('Item dropped on same slot, no change needed');
                this.pendingOperations.delete(item.id);
            }
        } else {
            // Item is from inventory
            if (targetSlotType !== 'inventory') {
                // Equip item from inventory
                console.log(`Equipping item ${item.id} to character ${targetCharacterId}`);
                this.processEquip(item, targetCharacterId);
            } else {
                // Dropped back in inventory, do nothing
                console.log('Item dropped back in inventory, no change needed');
                this.pendingOperations.delete(item.id);
            }
        }
        
        // Reset item position
        this.resetDraggedItem(gameObject);
    }
    
    private resetDraggedItem(gameObject: Phaser.GameObjects.Sprite): void {
        const originalX = gameObject.getData('originalX');
        const originalY = gameObject.getData('originalY');
        
        if (originalX !== undefined && originalY !== undefined) {
            gameObject.x = originalX;
            gameObject.y = originalY;
        }
    }
    
    private findDropZone(x: number, y: number): Phaser.GameObjects.GameObject | null {
        // Check character equipment slots
        for (const [characterId, slots] of this.characterEquipmentSlots.entries()) {
            for (const [slotType, container] of Object.entries(slots)) {
                const slotBg = container.getAt(0) as Phaser.GameObjects.Rectangle;
                
                // Get global bounds of the slot
                const bounds = new Phaser.Geom.Rectangle(
                    container.x - 20,
                    container.y - 20,
                    40,
                    40
                );
                
                if (bounds.contains(x, y)) {
                    return slotBg;
                }
            }
        }
        
        // Check inventory slots - inventory container should exist by now
        for (let i = 0; i < this.inventoryContainer.length; i++) {
            const object = this.inventoryContainer.getAt(i);
            if (object instanceof Phaser.GameObjects.Rectangle && object.getData('slotType') === 'inventory') {
                const bounds = new Phaser.Geom.Rectangle(
                    object.x,
                    object.y,
                    object.width,
                    object.height
                );
                
                if (bounds.contains(x, y)) {
                    return object;
                }
            }
        }
        
        return null;
    }
    
    // Process equip/unequip operations
    private async processEquip(item: Item, characterId: string): Promise<void> {
        try {
            console.log(`Equipping item ${item.id} to character ${characterId}`);
            
            const result = await apiService.equipItem(characterId, item.id);
            console.log('Equip result:', result);
            
            // Refresh the display
            this.loadAllCharacterItems();
        } catch (error) {
            console.error('Error equipping item:', error);
        } finally {
            this.pendingOperations.delete(item.id);
        }
    }
    
    private async processUnequip(item: Item, characterId: string): Promise<void> {
        try {
            console.log(`Unequipping item ${item.id} from character ${characterId}`);
            
            const result = await apiService.unequipItem(characterId, item.id);
            console.log('Unequip result:', result);
            
            // Refresh the display
            this.loadAllCharacterItems();
        } catch (error) {
            console.error('Error unequipping item:', error);
        } finally {
            this.pendingOperations.delete(item.id);
        }
    }
    
    private async processItemTransfer(item: Item, fromCharacterId: string, toCharacterId: string): Promise<void> {
        try {
            console.log(`Transferring item ${item.id} from ${fromCharacterId} to ${toCharacterId}`);
            
            // Unequip from current character
            await apiService.unequipItem(fromCharacterId, item.id);
            
            // Equip to new character
            await apiService.equipItem(toCharacterId, item.id);
            
            // Refresh the display
            this.loadAllCharacterItems();
        } catch (error) {
            console.error('Error transferring item:', error);
        } finally {
            this.pendingOperations.delete(item.id);
        }
    }
    
    // Helper to get the appropriate texture key for an item type
    private getItemTexture(itemType: string): string {
        switch (itemType) {
            case 'Weapon':
                return 'sword';
            case 'Armor':
                return 'armor';
            case 'Accessory':
                return 'ring';
            default:
                return 'item';
        }
    }
    
    // Helper to get the equipment slot name from item type
    private getSlotTypeFromItemType(itemType: string): string {
        switch (itemType) {
            case 'Weapon':
                return 'weapon';
            case 'Armor':
                return 'armor';
            case 'Accessory':
                return 'accessory';
            default:
                return 'weapon'; // fallback
        }
    }
} 