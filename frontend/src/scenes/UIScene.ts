import Phaser from 'phaser';
import { Character } from '../models/Character';

export class UIScene extends Phaser.Scene {
    private characters: Character[] = [];
    
    constructor() {
        super({ key: 'UIScene', active: false });
    }
    
    init(data: { characters: Character[] }): void {
        this.characters = data.characters;
    }
    
    create(): void {
        const { width, height } = this.cameras.main;
        
        // Create UI elements
        this.createPartyInfoPanel();
        
        // Create mini-map or other UI elements as needed
        
        // Setup input events for UI elements
    }
    
    update(): void {
        // Update UI elements based on game state
    }
    
    private createPartyInfoPanel(): void {
        const { width } = this.cameras.main;
        
        // Create party info container at the top right
        const panelX = width - 200;
        const panelY = 10;
        
        // Background panel
        this.add.rectangle(panelX, panelY, 190, 80, 0x000000, 0.5)
            .setOrigin(0)
            .setStrokeStyle(1, 0xffffff, 0.3);
        
        // Panel title
        this.add.text(panelX + 10, panelY + 10, 'PARTY', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0);
        
        // Create compact character info
        this.characters.forEach((character, index) => {
            const y = panelY + 35 + (index * 15);
            
            // Character name and class
            this.add.text(panelX + 15, y, `${character.name} (${character.class})`, {
                fontSize: '10px',
                color: '#ffffff'
            }).setOrigin(0);
            
            // Level
            this.add.text(panelX + 170, y, `Lv.${character.level}`, {
                fontSize: '10px',
                color: '#ffff00'
            }).setOrigin(0.5);
        });
    }
} 