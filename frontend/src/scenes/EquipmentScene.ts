import Phaser from 'phaser';
import { Character } from '../models/Character';
import { Item, ItemType } from '../models/Item';
import { apiService } from '../services/api.service';

export class EquipmentScene extends Phaser.Scene {
    private characters: Character[] = [];
    private selectedCharacter: Character | null = null;
    private characterItems: Item[] = [];
    private equipmentSlots: Record<string, Phaser.GameObjects.Container> = {};
    private characterSelectors: Phaser.GameObjects.Container[] = [];

    constructor() {
        super('EquipmentScene');
    }

    preload(): void {
        // Check if item textures are loaded, if not load them
        if (!this.textures.exists('sword')) {
            this.load.image('sword', 'assets/images/items/sword.png');
        }
        if (!this.textures.exists('staff')) {
            this.load.image('staff', 'assets/images/items/staff.png');
        }
        if (!this.textures.exists('bow')) {
            this.load.image('bow', 'assets/images/items/bow.png');
        }
        // Additional textures for different item types
        if (!this.textures.exists('armor')) {
            this.load.image('armor', 'assets/images/items/staff.png');
        }
        if (!this.textures.exists('ring')) {
            this.load.image('ring', 'assets/images/items/bow.png');
        }
        if (!this.textures.exists('item')) {
            this.load.image('item', 'assets/images/items/sword.png');
        }
    }

    init(data: { characters: Character[] }): void {
        this.characters = data.characters;
        this.selectedCharacter = this.characters.length > 0 ? this.characters[0] : null;
    }

    async create(): Promise<void> {
        const { width, height } = this.cameras.main;

        // Create background
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

        // Add title
        this.add.text(width / 2, 40, 'Equipment', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create character selection area
        this.createCharacterSelection();

        // Create equipment slots
        this.createEquipmentSlots();

        // Load character items and update equipment display
        if (this.selectedCharacter) {
            await this.loadCharacterItems(this.selectedCharacter.id);
            this.updateEquipmentDisplay();
        }

        // Create close button
        const closeButton = this.add.text(width - 50, 40, 'X', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('WorldMapScene');
        });

        // Create inventory button
        const inventoryButton = this.add.text(width / 2, height - 50, 'Inventory', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        inventoryButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.launch('InventoryScene', { characters: this.characters });
        });
    }

    private createCharacterSelection(): void {
        const { width } = this.cameras.main;
        const startX = 120;
        const startY = 120;
        const spacing = 150;

        this.characterSelectors = [];

        this.characters.forEach((character, index) => {
            const x = startX + (index * spacing);
            
            const container = this.add.container(x, startY);
            
            // Selection background
            const bg = this.add.rectangle(0, 0, 120, 140, 0x333333, 0.8)
                .setStrokeStyle(2, 0x666666);
            
            if (this.selectedCharacter && character.id === this.selectedCharacter.id) {
                bg.setStrokeStyle(3, 0xffff00);
            }
            
            container.add(bg);
            
            // Character icon (based on class)
            const characterIcon = this.add.image(0, -20, character.class.toLowerCase())
                .setScale(0.8);
            container.add(characterIcon);
            
            // Character name
            const nameText = this.add.text(0, 50, character.name, {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add(nameText);
            
            // Level info
            const levelText = this.add.text(0, 70, `Level ${character.level}`, {
                fontSize: '12px',
                color: '#cccccc'
            }).setOrigin(0.5);
            container.add(levelText);
            
            // Make selectable
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerdown', async () => {
                // Update selection
                this.selectedCharacter = character;
                
                // Update visuals
                this.characterSelectors.forEach(selector => {
                    const selectorBg = selector.getAt(0) as Phaser.GameObjects.Rectangle;
                    selectorBg.setStrokeStyle(2, 0x666666);
                });
                
                bg.setStrokeStyle(3, 0xffff00);
                
                // Load items and update display
                if (this.selectedCharacter) {
                    await this.loadCharacterItems(this.selectedCharacter.id);
                    this.updateEquipmentDisplay();
                }
            });
            
            this.characterSelectors.push(container);
        });
    }

    private createEquipmentSlots(): void {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const startY = 220;
        
        // Character stats
        if (this.selectedCharacter) {
            const statsContainer = this.add.container(centerX, startY - 30);
            
            const statsText = this.add.text(0, 0, 
                `HP: ${this.selectedCharacter.hp}/${this.selectedCharacter.maxHp}   ` +
                `MP: ${this.selectedCharacter.mp}/${this.selectedCharacter.maxMp}`, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            statsContainer.add(statsText);
        }
        
        // Equipment slots
        const slotTypes = ['Weapon', 'Armor', 'Accessory'];
        const slotSpacing = 150;
        
        slotTypes.forEach((slotType, index) => {
            const x = centerX + (index - 1) * slotSpacing;
            const y = startY + 80;
            
            const container = this.add.container(x, y);
            
            // Slot background
            const slotBg = this.add.rectangle(0, 0, 120, 140, 0x222222, 0.8)
                .setStrokeStyle(2, 0x666666);
            container.add(slotBg);
            
            // Slot label
            const labelText = this.add.text(0, -80, slotType, {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(labelText);
            
            // Empty icon placeholder
            const emptyIcon = this.add.text(0, 0, '?', {
                fontSize: '30px',
                color: '#666666'
            }).setOrigin(0.5);
            container.add(emptyIcon);
            
            // Empty slot text
            const emptyText = this.add.text(0, 60, 'Empty', {
                fontSize: '14px',
                color: '#888888'
            }).setOrigin(0.5);
            container.add(emptyText);
            
            this.equipmentSlots[slotType] = container;
        });
    }

    private async loadCharacterItems(characterId: string): Promise<void> {
        try {
            console.log(`EquipmentScene: Loading items for character ${characterId}`);
            // Fetch character items from API
            const items = await apiService.getCharacterItems(characterId);
            console.log('EquipmentScene: Loaded items:', items);
            
            // Process items to ensure equipped status is correctly set
            items.forEach(item => {
                if (item.equippedBy === characterId) {
                    item.equipped = true;
                }
            });
            
            // Log equipped items for debugging
            const equippedItems = items.filter(item => item.equipped);
            console.log('EquipmentScene: Equipped items:', equippedItems);
            
            this.characterItems = items;
        } catch (error) {
            console.error('Failed to load character items:', error);
            this.characterItems = [];
        }
    }

    private updateEquipmentDisplay(): void {
        if (!this.selectedCharacter) return;
        
        // Get equipped items
        const equippedItems = this.characterItems.filter(item => item.equipped);
        
        // Reset slots
        Object.keys(this.equipmentSlots).forEach(slotType => {
            const container = this.equipmentSlots[slotType];
            
            // Clear previous item display if any
            container.getAll().forEach(obj => {
                if (obj.getData('itemDisplay')) {
                    obj.destroy();
                }
            });
            
            // Show empty placeholder
            const emptyIcon = container.getAt(2) as Phaser.GameObjects.Text;
            const emptyText = container.getAt(3) as Phaser.GameObjects.Text;
            
            emptyIcon.setVisible(true);
            emptyText.setVisible(true);
        });
        
        // Fill equipped items
        equippedItems.forEach(item => {
            const slotType = item.type;
            const container = this.equipmentSlots[slotType];
            
            if (container) {
                // Hide empty placeholder
                const emptyIcon = container.getAt(2) as Phaser.GameObjects.Text;
                const emptyText = container.getAt(3) as Phaser.GameObjects.Text;
                
                emptyIcon.setVisible(false);
                emptyText.setVisible(false);
                
                // Item background based on rarity
                const bgColor = this.getRarityColor(item.rarity);
                const itemBg = this.add.rectangle(0, 0, 80, 80, bgColor, 0.7)
                    .setStrokeStyle(2, 0xffffff)
                    .setData('itemDisplay', true);
                container.add(itemBg);
                
                // Item icon
                const icon = this.add.text(0, 0, this.getItemIconKey(item.type), {
                    fontSize: '24px',
                    color: '#ffffff'
                }).setOrigin(0.5).setData('itemDisplay', true);
                container.add(icon);
                
                // Item name
                const nameText = this.add.text(0, 50, item.name, {
                    fontSize: '12px',
                    color: this.getRarityColorHex(item.rarity)
                }).setOrigin(0.5).setData('itemDisplay', true);
                container.add(nameText);
                
                // Item level
                const levelText = this.add.text(0, 70, `Level ${item.level}`, {
                    fontSize: '10px',
                    color: '#ffffff'
                }).setOrigin(0.5).setData('itemDisplay', true);
                container.add(levelText);
                
                // Make interactive to show details
                itemBg.setInteractive({ useHandCursor: true });
                
                itemBg.on('pointerover', () => {
                    this.showItemTooltip(item, container.x, container.y);
                });
                
                itemBg.on('pointerout', () => {
                    this.hideItemTooltip();
                });
            }
        });
        
        // Update character stats display
        if (this.selectedCharacter) {
            const statsText = `HP: ${this.selectedCharacter.hp}/${this.selectedCharacter.maxHp}   ` +
                             `MP: ${this.selectedCharacter.mp}/${this.selectedCharacter.maxMp}`;
            
            // Find and update the stats text
            const statsContainer = this.children.getAll().find(
                obj => obj instanceof Phaser.GameObjects.Container && obj.y === 190
            ) as Phaser.GameObjects.Container;
            
            if (statsContainer) {
                const textObj = statsContainer.getAt(0) as Phaser.GameObjects.Text;
                textObj.setText(statsText);
            }
        }
    }

    private showItemTooltip(item: Item, x: number, y: number): void {
        // Clear existing tooltip
        this.hideItemTooltip();
        
        const tooltipWidth = 200;
        const tooltipHeight = 140;
        const tooltipX = x;
        const tooltipY = y - 100;
        
        // Tooltip background
        const bg = this.add.rectangle(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 0x000000, 0.9)
            .setStrokeStyle(2, this.getRarityColor(item.rarity))
            .setData('tooltip', true);
        
        // Item name
        const nameText = this.add.text(tooltipX, tooltipY - 50, item.name, {
            fontSize: '16px',
            color: this.getRarityColorHex(item.rarity),
            fontStyle: 'bold'
        }).setOrigin(0.5).setData('tooltip', true);
        
        // Item type and level
        const typeText = this.add.text(tooltipX, tooltipY - 30, `${item.type} - Level ${item.level}`, {
            fontSize: '12px',
            color: '#cccccc'
        }).setOrigin(0.5).setData('tooltip', true);
        
        // Item stats
        let statsText = '';
        
        if (item.stats) {
            if (item.stats.attack) statsText += `Attack: +${item.stats.attack}\n`;
            if (item.stats.defense) statsText += `Defense: +${item.stats.defense}\n`;
            if (item.stats.hp) statsText += `HP: +${item.stats.hp}\n`;
            if (item.stats.mp) statsText += `MP: +${item.stats.mp}\n`;
        }
        
        if (statsText) {
            const statValues = this.add.text(tooltipX, tooltipY + 10, statsText, {
                fontSize: '12px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setData('tooltip', true);
        }
        
        // Item description
        if (item.description) {
            const descText = this.add.text(tooltipX, tooltipY + 40, item.description, {
                fontSize: '10px',
                color: '#aaaaaa',
                align: 'center',
                wordWrap: { width: tooltipWidth - 20 }
            }).setOrigin(0.5).setData('tooltip', true);
        }
    }

    private hideItemTooltip(): void {
        this.children.getAll().forEach(obj => {
            if (obj.getData('tooltip')) {
                obj.destroy();
            }
        });
    }

    private getRarityColor(rarity: string): number {
        switch (rarity) {
            case 'Common': return 0x888888;
            case 'Uncommon': return 0x00cc00;
            case 'Rare': return 0x0099ff;
            case 'Epic': return 0xcc00ff;
            case 'Legendary': return 0xffaa00;
            default: return 0x888888;
        }
    }

    private getRarityColorHex(rarity: string): string {
        switch (rarity) {
            case 'Common': return '#cccccc';
            case 'Uncommon': return '#00cc00';
            case 'Rare': return '#0099ff';
            case 'Epic': return '#cc00ff';
            case 'Legendary': return '#ffaa00';
            default: return '#cccccc';
        }
    }

    private getItemIconKey(type: string): string {
        switch (type) {
            case 'Weapon': return '⚔️';
            case 'Armor': return '🛡️';
            case 'Accessory': return '💍';
            case 'Material': return '🧪';
            case 'Consumable': return '🧪';
            default: return '?';
        }
    }
} 