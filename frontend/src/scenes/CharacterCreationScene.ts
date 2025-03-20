import Phaser from 'phaser';
import { Character, CharacterClass } from '../models/Character';
import { apiService } from '../services/api.service';

interface CharacterTemplate {
    class: CharacterClass;
    description: string;
    stats: {
        hp: number;
        mp: number;
        attack: number;
        defense: number;
    };
    skills: {
        id: string;
        name: string;
        description: string;
        mpCost: number;
        cooldown: number;
        damage?: number;
        healing?: number;
    }[];
}

export class CharacterCreationScene extends Phaser.Scene {
    private userId: string = '';
    private characterTemplates: Record<CharacterClass, CharacterTemplate> = {
        Fighter: {
            class: 'Fighter',
            description: 'A strong melee warrior with high HP and attack power.',
            stats: { hp: 150, mp: 30, attack: 15, defense: 10 },
            skills: [
                {
                    id: 'slash',
                    name: 'Slash',
                    description: 'A powerful slash that deals damage to a single enemy.',
                    mpCost: 5,
                    cooldown: 3000,
                    damage: 25
                },
                {
                    id: 'shout',
                    name: 'Battle Shout',
                    description: 'Increases the attack power of all allies temporarily.',
                    mpCost: 15,
                    cooldown: 15000
                }
            ]
        },
        Priest: {
            class: 'Priest',
            description: 'A holy caster with powerful healing abilities.',
            stats: { hp: 100, mp: 120, attack: 5, defense: 8 },
            skills: [
                {
                    id: 'heal',
                    name: 'Heal',
                    description: 'Restores HP to a single ally.',
                    mpCost: 15,
                    cooldown: 5000,
                    healing: 50
                },
                {
                    id: 'smite',
                    name: 'Smite',
                    description: 'Deals holy damage to an enemy.',
                    mpCost: 10,
                    cooldown: 4000,
                    damage: 15
                }
            ]
        },
        Rogue: {
            class: 'Rogue',
            description: 'A fast attacker with high critical hit chance.',
            stats: { hp: 120, mp: 50, attack: 12, defense: 6 },
            skills: [
                {
                    id: 'backstab',
                    name: 'Backstab',
                    description: 'A deadly attack from behind that deals high damage.',
                    mpCost: 10,
                    cooldown: 6000,
                    damage: 35
                },
                {
                    id: 'evade',
                    name: 'Evade',
                    description: 'Increases your dodge chance temporarily.',
                    mpCost: 15,
                    cooldown: 20000
                }
            ]
        },
        Archer: {
            class: 'Archer',
            description: 'A ranged attacker with high precision.',
            stats: { hp: 110, mp: 60, attack: 14, defense: 5 },
            skills: [
                {
                    id: 'rapidshot',
                    name: 'Rapid Shot',
                    description: 'Fires multiple arrows in quick succession.',
                    mpCost: 15,
                    cooldown: 8000,
                    damage: 30
                },
                {
                    id: 'pindown',
                    name: 'Pin Down',
                    description: 'Slows an enemy and deals damage over time.',
                    mpCost: 20,
                    cooldown: 12000,
                    damage: 20
                }
            ]
        },
        Wizard: {
            class: 'Wizard',
            description: 'A powerful spellcaster with devastating area attacks.',
            stats: { hp: 90, mp: 150, attack: 18, defense: 4 },
            skills: [
                {
                    id: 'fireball',
                    name: 'Fireball',
                    description: 'Launches a ball of fire that explodes on impact.',
                    mpCost: 25,
                    cooldown: 10000,
                    damage: 40
                },
                {
                    id: 'frostarmor',
                    name: 'Frost Armor',
                    description: 'Surrounds you with protective frost that damages attackers.',
                    mpCost: 30,
                    cooldown: 15000
                }
            ]
        }
    };
    
    private selectedClass: CharacterClass = 'Fighter';
    private characterName: string = '';
    private nameInput!: HTMLInputElement;
    private errorText!: Phaser.GameObjects.Text;
    private loadingText!: Phaser.GameObjects.Text;
    
    constructor() {
        super('CharacterCreationScene');
    }
    
    init(data: { userId: string }): void {
        console.log('CharacterCreationScene init with data:', data);
        this.userId = data.userId;
    }
    
    create(): void {
        console.log('CharacterCreationScene create method starting');
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x112244).setOrigin(0);
        
        // Title
        this.add.text(width / 2, 60, 'Create Your Character', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Create class selection
        this.createClassSelection();
        
        // Create character name input
        this.createNameInput();
        
        // Error text
        this.errorText = this.add.text(width / 2, height - 130, '', {
            fontSize: '16px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Loading text
        this.loadingText = this.add.text(width / 2, height - 100, 'Creating character...', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setVisible(false);
        
        // Create button
        const createButton = this.add.rectangle(width / 2, height - 70, 220, 40, 0x3333aa)
            .setInteractive({ useHandCursor: true });
        
        const createText = this.add.text(width / 2, height - 70, 'Create Character', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        createButton.on('pointerdown', () => {
            this.createCharacter();
        });
        
        console.log('CharacterCreationScene create method completed');
    }
    
    private createClassSelection(): void {
        const { width, height } = this.cameras.main;
        const startX = 160;
        const y = 180;
        const spacing = 200;
        
        // Create class options
        Object.entries(this.characterTemplates).forEach(([className, template], index) => {
            const x = startX + (index * spacing);
            
            // Class container
            const container = this.add.container(x, y);
            
            // Background
            const bg = this.add.rectangle(0, 0, 160, 240, 0x223355, 0.8)
                .setStrokeStyle(2, 0x3333aa);
            container.add(bg);
            
            // Class name (instead of trying to use image)
            const nameText = this.add.text(0, -100, className, {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(nameText);
            
            // Class icon (placeholder)
            const classIcon = this.add.rectangle(0, -60, 50, 50, this.getClassColor(className as CharacterClass));
            container.add(classIcon);
            
            // Stats
            const stats = template.stats;
            const statsText = this.add.text(0, 20, 
                `HP: ${stats.hp}\nMP: ${stats.mp}\nATK: ${stats.attack}\nDEF: ${stats.defense}`, {
                fontSize: '14px',
                color: '#cccccc',
                align: 'center'
            }).setOrigin(0.5);
            container.add(statsText);
            
            // Make clickable
            bg.setInteractive({ useHandCursor: true });
            
            bg.on('pointerdown', () => {
                this.selectClass(className as CharacterClass);
                
                // Update visuals
                this.children.getAll().forEach((obj) => {
                    if (obj instanceof Phaser.GameObjects.Rectangle && obj !== bg) {
                        obj.setStrokeStyle(2, 0x3333aa);
                    }
                });
                
                bg.setStrokeStyle(4, 0xffff00);
            });
            
            // Highlight default selection
            if (className === this.selectedClass) {
                bg.setStrokeStyle(4, 0xffff00);
            }
        });
        
        // Class description
        this.add.text(width / 2, height - 200, this.characterTemplates[this.selectedClass].description, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5).setName('classDescription');
    }
    
    private getClassColor(characterClass: CharacterClass): number {
        switch (characterClass) {
            case 'Fighter': return 0xcc3333; // Red
            case 'Priest': return 0xffffaa;  // Light yellow
            case 'Rogue': return 0x339933;   // Green
            case 'Archer': return 0x993399;  // Purple
            case 'Wizard': return 0x3333cc;  // Blue
            default: return 0xffffff;        // White
        }
    }
    
    private createNameInput(): void {
        const { width, height } = this.cameras.main;
        
        // Label
        this.add.text(width / 2, height - 280, 'Character Name:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Create HTML input for character name
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Enter name (3-20 characters)';
        this.nameInput.style.position = 'absolute';
        this.nameInput.style.top = `${height - 250}px`;
        this.nameInput.style.left = `${width / 2 - 100}px`;
        this.nameInput.style.width = '200px';
        this.nameInput.style.padding = '8px';
        this.nameInput.style.borderRadius = '4px';
        this.nameInput.style.border = '1px solid #3333aa';
        this.nameInput.style.backgroundColor = '#1a1a2e';
        this.nameInput.style.color = 'white';
        this.nameInput.style.textAlign = 'center';
        document.body.appendChild(this.nameInput);
        
        // Focus input
        this.nameInput.focus();
    }
    
    private selectClass(characterClass: CharacterClass): void {
        this.selectedClass = characterClass;
        
        // Update description
        const description = this.children.getByName('classDescription');
        if (description && description instanceof Phaser.GameObjects.Text) {
            description.setText(this.characterTemplates[characterClass].description);
        }
    }
    
    private async createCharacter(): Promise<void> {
        // Validate character name
        const name = this.nameInput.value.trim();
        if (!name) {
            this.errorText.setText('Please enter a character name');
            return;
        }
        
        // Hide error text and show loading text
        this.errorText.setText('');
        this.loadingText.setVisible(true);
        
        try {
            console.log('Creating character with name:', name, 'class:', this.selectedClass);
            
            // Create character
            const characterData = {
                name,
                class: this.selectedClass,
                userId: this.userId,
                ...this.characterTemplates[this.selectedClass].stats
            };
            
            const character = await apiService.createCharacter(characterData);
            console.log('Character created successfully:', character);
            
            // Safely remove input element
            try {
                if (this.nameInput && document.body.contains(this.nameInput)) {
                    document.body.removeChild(this.nameInput);
                }
            } catch (error) {
                console.error('Error removing name input:', error);
                // Continue even if removal fails
            }
            
            // Get all user's characters and load the barracks scene
            console.log('Getting updated character list');
            const characters = await apiService.getCharacters(this.userId);
            console.log('Returning to barracks with updated characters:', characters);
            
            // Navigate back to barracks scene with updated characters
            this.scene.start('BarracksScene', { 
                userId: this.userId,
                characters
            });
        } catch (error) {
            console.error('Failed to create character:', error);
            this.errorText.setText('Failed to create character. Please try again.');
            this.loadingText.setVisible(false);
        }
    }
    
    shutdown(): void {
        // Clean up input element when scene is shut down
        if (this.nameInput && document.body.contains(this.nameInput)) {
            document.body.removeChild(this.nameInput);
        }
    }
} 