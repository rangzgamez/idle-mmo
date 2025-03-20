import Phaser from 'phaser';
import { Character } from '../models/Character';
import { apiService } from '../services/api.service';
import { StatsUpdater } from '../components/StatsUpdater';

export class BarracksScene extends Phaser.Scene {
    private userId: string = '';
    private characters: Character[] = [];
    private selectedCharacters: Character[] = [];
    private characterDisplays: Phaser.GameObjects.Container[] = [];
    private ventureButton!: Phaser.GameObjects.Text;
    private createCharacterButton!: Phaser.GameObjects.Text;
    private logoutButton!: Phaser.GameObjects.Text;
    private loadingText!: Phaser.GameObjects.Text;
    private nameInput: HTMLInputElement | null = null;
    private background!: Phaser.GameObjects.Rectangle;
    private characterCards: Phaser.GameObjects.Container[] = [];

    constructor() {
        super('BarracksScene');
    }
    
    init(data: { userId: string; characters?: Character[] }): void {
        console.log('BarracksScene init with data:', data);
        this.userId = data.userId;
        
        if (data.characters) {
            this.characters = data.characters;
        }
    }

    create(): void {
        console.log('BarracksScene create starting');
        const { width, height } = this.cameras.main;
        
        this.background = this.add.rectangle(0, 0, width, height, 0x111122)
            .setOrigin(0)
            .setInteractive();
        
        // Scene title
        this.add.text(width / 2, 50, 'Barracks', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Loading message
        this.loadingText = this.add.text(width / 2, height / 2, 'Loading characters...', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Get user ID from local storage
        this.userId = localStorage.getItem('userId') || '';
        
        if (!this.userId) {
            this.loadingText.setText('No user ID found. Please log in again.');
            this.scene.start('AuthScene');
            return;
        }
        
        // Add create character button
        const createButton = this.add.rectangle(width / 2, height - 100, 200, 50, 0x227722)
            .setInteractive({ useHandCursor: true });
        
        this.add.text(width / 2, height - 100, 'Create Character', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        createButton.on('pointerdown', () => {
            this.scene.start('CharacterCreationScene', { userId: this.userId });
        });
        
        // Add logout button
        const logoutButton = this.add.rectangle(width - 100, 50, 150, 40, 0x772222)
            .setInteractive({ useHandCursor: true });
        
        this.add.text(width - 100, 50, 'Logout', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        logoutButton.on('pointerdown', () => {
            this.logout();
        });
        
        // Add update stats button
        const updateStatsButton = this.add.rectangle(120, height - 40, 180, 30, 0x227788)
            .setInteractive({ useHandCursor: true });
        
        this.add.text(120, height - 40, 'Update Character Stats', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        updateStatsButton.on('pointerdown', async () => {
            try {
                // Disable the button while updating
                updateStatsButton.disableInteractive();
                
                // Show updating message
                const updatingText = this.add.text(120, height - 70, 'Updating stats...', {
                    fontSize: '12px',
                    color: '#ffff00'
                }).setOrigin(0.5);
                
                // Call the stats updater
                await StatsUpdater.updateAllCharacterStats();
                
                // Reload characters to show updated stats
                await this.loadCharacters();
                
                // Show success message
                updatingText.setText('Stats updated!').setColor('#00ff00');
                
                // Hide message after 2 seconds
                this.time.delayedCall(2000, () => {
                    updatingText.destroy();
                });
                
                // Re-enable the button
                updateStatsButton.setInteractive({ useHandCursor: true });
            } catch (error) {
                console.error('Failed to update stats:', error);
                this.add.text(120, height - 70, 'Update failed!', {
                    fontSize: '12px',
                    color: '#ff0000'
                }).setOrigin(0.5);
                
                // Re-enable the button
                updateStatsButton.setInteractive({ useHandCursor: true });
            }
        });
        
        // Load characters
        this.loadCharacters();
        
        // Venture button (disabled initially if no characters selected)
        this.ventureButton = this.add.text(width / 2, height - 50, 'Venture Forth', {
            fontSize: '24px',
            color: '#999999',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // Update venture button state
        this.updateVentureButton();
        
        console.log('BarracksScene create complete');
    }
    
    private async loadCharacters(): Promise<void> {
        try {
            // Load characters from the backend
            this.characters = await apiService.getCharacters(this.userId);
            this.loadingText.setVisible(false);
            
            if (this.characters.length > 0) {
                this.displayCharacters();
            } else {
                // No characters found, show message
                const { width, height } = this.cameras.main;
                this.add.text(width / 2, height / 2, 'No characters found. Create a new one!', {
                    fontSize: '24px',
                    color: '#ffffff'
                }).setOrigin(0.5);
            }
        } catch (error) {
            console.error('Failed to load characters:', error);
            this.loadingText.setText('Failed to load characters. Please try again.');
        }
    }
    
    private displayCharacters(): void {
        console.log('Displaying characters:', this.characters);
        const { width, height } = this.cameras.main;
        
        if (this.characters.length === 0) {
            this.add.text(width / 2, height / 2, 'No characters found.\nCreate a new character to begin.', {
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            return;
        }
        
        // Clear existing character displays if any
        this.children.getAll()
            .filter(obj => obj.getData('characterId'))
            .forEach(obj => obj.destroy());
        
        // Display characters
        const startX = width / 2 - ((this.characters.length - 1) * 150);
        const y = height / 2 - 50;
        
        this.characters.forEach((character, index) => {
            const x = startX + (index * 300);
            console.log(`Creating character ${character.name} at position ${x}, ${y}`);
            
            // Character container
            const container = this.add.container(x, y);
            container.setData('characterId', character.id);
            
            // Character background/card
            const bg = this.add.rectangle(0, 0, 250, 300, 0x333355, 0.8)
                .setStrokeStyle(2, 0x6666aa)
                .setInteractive({ useHandCursor: true });
            container.add(bg);
            
            // Character info
            const nameText = this.add.text(0, -120, character.name, {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(nameText);
            
            // Class text
            const classText = this.add.text(0, -90, `Level ${character.level} ${character.class}`, {
                fontSize: '18px',
                color: '#ccccff'
            }).setOrigin(0.5);
            container.add(classText);
            
            // Class icon (placeholder colored rectangle)
            const classColor = this.getClassColor(character.class);
            const classIcon = this.add.rectangle(0, -40, 60, 60, classColor);
            container.add(classIcon);
            
            // Stats
            const statsText = this.add.text(0, 40, 
                `HP: ${character.hp}/${character.maxHp}\n` +
                `MP: ${character.mp}/${character.maxMp}\n` +
                `EXP: ${character.exp}`, {
                fontSize: '16px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
            container.add(statsText);
            
            // Select button
            const selectButton = this.add.rectangle(0, 100, 120, 40, 0x444466)
                .setInteractive({ useHandCursor: true });
            container.add(selectButton);
            
            const selectText = this.add.text(0, 100, 'Select', {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add(selectText);
            
            // Logic for selecting characters
            bg.on('pointerdown', () => {
                this.toggleCharacterSelection(character);
            });
            
            selectButton.on('pointerdown', () => {
                this.toggleCharacterSelection(character);
            });
            
            // If character is already selected, highlight it
            if (this.selectedCharacters.some(c => c.id === character.id)) {
                bg.setStrokeStyle(4, 0xffcc00);
            }
        });
    }
    
    private toggleCharacterSelection(character: Character): void {
        console.log('Toggling selection for character:', character.name);
        
        // Check if character is already selected
        const index = this.selectedCharacters.findIndex(c => c.id === character.id);
        
        if (index !== -1) {
            // Deselect character
            this.selectedCharacters.splice(index, 1);
        } else {
            // Don't allow more than 3 characters
            if (this.selectedCharacters.length >= 3) {
                console.log('Cannot select more than 3 characters');
                return;
            }
            
            // Select character
            this.selectedCharacters.push(character);
        }
        
        // Refresh character display to update selection visuals
        this.displayCharacters();
        
        // Update venture button state
        this.updateVentureButton();
    }
    
    private updateVentureButton(): void {
        if (this.selectedCharacters.length > 0) {
            this.ventureButton.setStyle({
                color: '#ffffff',
                backgroundColor: '#4444aa'
            });
            this.ventureButton.setInteractive({ useHandCursor: true });
            
            this.ventureButton.off('pointerdown');
            this.ventureButton.on('pointerdown', () => {
                console.log('Venturing forth with characters:', this.selectedCharacters);
                this.scene.start('WorldMapScene', { selectedCharacters: this.selectedCharacters });
            });
        } else {
            this.ventureButton.setStyle({
                color: '#999999',
                backgroundColor: '#333333'
            });
            this.ventureButton.disableInteractive();
        }
    }
    
    private logout(): void {
        console.log('Logging out, clearing authentication data');
        
        // Safely remove input element if present
        try {
            if (this.nameInput && document.body.contains(this.nameInput)) {
                document.body.removeChild(this.nameInput);
            }
        } catch (error) {
            console.error('Error removing input element:', error);
            // Continue with logout even if input removal fails
        }
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Return to auth scene
        console.log('Redirecting to AuthScene');
        this.scene.start('AuthScene');
    }

    private getClassColor(characterClass: string): number {
        switch (characterClass) {
            case 'Fighter': return 0xcc3333; // Red
            case 'Priest': return 0xffffaa;  // Light yellow
            case 'Rogue': return 0x339933;   // Green
            case 'Archer': return 0x993399;  // Purple
            case 'Wizard': return 0x3333cc;  // Blue
            default: return 0xffffff;        // White
        }
    }
} 