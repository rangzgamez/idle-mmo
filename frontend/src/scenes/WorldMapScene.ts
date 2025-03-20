import Phaser from 'phaser';
import { Character } from '../models/Character';
import { apiService } from '../services/api.service';

interface Zone {
    id: string;
    name: string;
    levelRange: string;
    position: { x: number, y: number };
    size: number;
    color: number;
}

export class WorldMapScene extends Phaser.Scene {
    private characters: Character[] = [];
    private zones: Zone[] = [];
    private selectedZone: Zone | null = null;
    private savingText: Phaser.GameObjects.Text | null = null;
    
    constructor() {
        super('WorldMapScene');
    }
    
    init(data: { selectedCharacters: Character[] }): void {
        // Handle character progress updates
        this.characters = data.selectedCharacters;
        
        // Save character progress if returning from combat
        this.saveCharacterProgress();
    }
    
    create(): void {
        const { width, height } = this.cameras.main;
        
        // Add world map background
        this.add.rectangle(0, 0, width, height, 0x003366).setOrigin(0);
        
        // Map title
        this.add.text(width / 2, 50, 'World Map', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Logout button
        const logoutButton = this.add.text(width - 20, 20, 'Logout', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.logout();
        });
        
        // Create zones
        this.createZones();
        
        // Display character info
        this.displayPartyInfo();
        
        // Back to barracks button
        const backButton = this.add.text(100, height - 50, 'Back to Barracks', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        backButton.on('pointerdown', () => {
            // Get userId from localStorage
            const userId = localStorage.getItem('userId');
            if (userId) {
                this.scene.start('BarracksScene', { 
                    userId, 
                    characters: this.characters 
                });
            } else {
                // If userId not found, return to auth scene
                this.scene.start('AuthScene');
            }
        });
        
        // Inventory button
        const inventoryButton = this.add.text(300, height - 50, 'Characters & Inventory', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        inventoryButton.on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('InventoryScene', { characters: this.characters });
        });
        
        // Saving indicator (initially hidden)
        this.savingText = this.add.text(width - 100, 30, 'Saving...', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setVisible(false);
    }
    
    private async saveCharacterProgress(): Promise<void> {
        try {
            if (this.characters.length === 0) return;
            
            // Show saving indicator
            if (this.savingText) this.savingText.setVisible(true);
            
            // Save each character's progress
            const savePromises = this.characters.map(character => {
                // Extract just the properties we want to update
                const updateData = {
                    level: character.level,
                    hp: character.hp,
                    maxHp: character.maxHp,
                    mp: character.mp,
                    maxMp: character.maxMp,
                    exp: character.exp
                };
                
                return apiService.updateCharacter(character.id, updateData);
            });
            
            await Promise.all(savePromises);
            
            // Hide saving indicator after short delay
            if (this.savingText) {
                this.savingText.setText('Saved!');
                this.time.delayedCall(1000, () => {
                    if (this.savingText) this.savingText.setVisible(false);
                });
            }
        } catch (error) {
            console.error('Failed to save character progress:', error);
            if (this.savingText) {
                this.savingText.setText('Save failed!');
                this.time.delayedCall(2000, () => {
                    if (this.savingText) this.savingText.setVisible(false);
                });
            }
        }
    }
    
    private createZones(): void {
        // Define zones with different level ranges
        this.zones = [
            {
                id: 'forest',
                name: 'Verdant Forest',
                levelRange: '1-5',
                position: { x: 300, y: 200 },
                size: 100,
                color: 0x2d8c32
            },
            {
                id: 'plains',
                name: 'Windswept Plains',
                levelRange: '5-10',
                position: { x: 500, y: 300 },
                size: 120,
                color: 0xa9c94f
            },
            {
                id: 'mountains',
                name: 'Rocky Highlands',
                levelRange: '10-15',
                position: { x: 700, y: 200 },
                size: 110,
                color: 0x8c7c6d
            },
            {
                id: 'desert',
                name: 'Scorching Wastes',
                levelRange: '15-20',
                position: { x: 900, y: 350 },
                size: 130,
                color: 0xe2d37a
            },
            {
                id: 'swamp',
                name: 'Murky Swamp',
                levelRange: '20-25',
                position: { x: 400, y: 450 },
                size: 100,
                color: 0x4c724a
            },
            {
                id: 'volcano',
                name: 'Volcanic Caldera',
                levelRange: '25-30',
                position: { x: 800, y: 500 },
                size: 150,
                color: 0xc92c2c
            }
        ];
        
        // Add zones to map
        this.zones.forEach(zone => {
            // Draw zone
            const zoneCircle = this.add.circle(zone.position.x, zone.position.y, zone.size, zone.color);
            
            // Add zone name
            const nameText = this.add.text(zone.position.x, zone.position.y, zone.name, {
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 1.5);
            
            // Add level range
            const levelText = this.add.text(zone.position.x, zone.position.y, `Levels ${zone.levelRange}`, {
                fontSize: '14px',
                color: '#dddddd',
                align: 'center'
            }).setOrigin(0.5, -0.5);
            
            // Make zone clickable
            zoneCircle.setInteractive({ useHandCursor: true });
            zoneCircle.on('pointerdown', () => {
                this.enterZone(zone);
            });
            
            // Add hover effect
            zoneCircle.on('pointerover', () => {
                zoneCircle.setStrokeStyle(4, 0xffffff);
                nameText.setColor('#ffff00');
            });
            
            zoneCircle.on('pointerout', () => {
                zoneCircle.setStrokeStyle(0, 0);
                nameText.setColor('#ffffff');
            });
        });
    }
    
    private displayPartyInfo(): void {
        const startX = 1100;
        const startY = 200;
        const spacing = 120;
        
        // Party info header
        this.add.text(startX, 150, 'YOUR PARTY', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Display character info
        this.characters.forEach((character, index) => {
            const y = startY + index * spacing;
            
            // Character container
            const container = this.add.container(startX, y);
            
            // Background
            const bg = this.add.rectangle(0, 0, 200, 100, 0x444444, 0.7).setOrigin(0.5);
            container.add(bg);
            
            // Character sprite
            const sprite = this.add.image(-70, 0, character.class.toLowerCase()).setScale(0.8);
            container.add(sprite);
            
            // Character info
            const nameText = this.add.text(0, -30, character.name, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);
            container.add(nameText);
            
            const classLevelText = this.add.text(0, -5, `${character.class} (Lvl ${character.level})`, {
                fontSize: '14px',
                color: '#cccccc'
            }).setOrigin(0, 0.5);
            container.add(classLevelText);
            
            // HP & MP bars
            this.addStatBar(container, 0, 15, 120, 12, 0xff0000, character.hp / character.maxHp, `HP: ${character.hp}/${character.maxHp}`);
            this.addStatBar(container, 0, 35, 120, 12, 0x0000ff, character.mp / character.maxMp, `MP: ${character.mp}/${character.maxMp}`);
        });
    }
    
    private addStatBar(
        container: Phaser.GameObjects.Container,
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        fillPercent: number,
        text: string
    ): void {
        // Background
        const bg = this.add.rectangle(x, y, width, height, 0x000000).setOrigin(0, 0.5);
        container.add(bg);
        
        // Fill
        const fill = this.add.rectangle(x, y, width * fillPercent, height, color).setOrigin(0, 0.5);
        container.add(fill);
        
        // Text
        const statText = this.add.text(x + width / 2, y, text, {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(statText);
    }
    
    private enterZone(zone: Zone): void {
        this.selectedZone = zone;
        this.scene.start('CombatScene', {
            selectedCharacters: this.characters,
            zone: zone
        });
    }
    
    private logout(): void {
        console.log('Logging out, clearing authentication data');
        
        // Safely remove any HTML elements that might be present
        try {
            // Additional cleanup if needed
        } catch (error) {
            console.error('Error during logout cleanup:', error);
            // Continue with logout even if cleanup fails
        }
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Return to auth scene
        console.log('Redirecting to AuthScene');
        this.scene.start('AuthScene');
    }
} 