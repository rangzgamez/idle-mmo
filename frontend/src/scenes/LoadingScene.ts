import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
    }

    preload(): void {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Display logo
        const logo = this.add.image(width / 2, height / 2 - 100, 'logo');
        logo.setScale(0.5);
        
        // Progress bar background
        const bgBar = this.add.rectangle(width / 2, height / 2 + 50, 400, 30, 0x333333);
        
        // Progress bar
        const progressBar = this.add.rectangle(width / 2 - 200, height / 2 + 50, 0, 30, 0x00ff00);
        progressBar.setOrigin(0, 0.5);
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 + 100, 'Loading...', {
            fontSize: '32px',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        // Update progress bar as assets load
        this.load.on('progress', (value: number) => {
            progressBar.width = 400 * value;
        });
        
        // Load game assets
        this.loadAssets();
    }

    create(): void {
        this.scene.start('BarracksScene');
    }
    
    private loadAssets(): void {
        // Characters
        this.load.image('fighter', 'assets/images/characters/fighter.png');
        this.load.image('priest', 'assets/images/characters/priest.png');
        this.load.image('rogue', 'assets/images/characters/rogue.png');
        this.load.image('archer', 'assets/images/characters/archer.png');
        this.load.image('wizard', 'assets/images/characters/wizard.png');
        
        // Enemies
        this.load.image('enemy1', 'assets/images/enemies/enemy1.png');
        this.load.image('enemy2', 'assets/images/enemies/enemy2.png');
        this.load.image('enemy3', 'assets/images/enemies/enemy3.png');
        
        // UI elements
        this.load.image('button', 'assets/images/ui/button.png');
        this.load.image('panel', 'assets/images/ui/panel.png');
        
        // Map tiles
        this.load.image('grass', 'assets/images/tiles/grass.png');
        this.load.image('water', 'assets/images/tiles/water.png');
        this.load.image('forest', 'assets/images/tiles/forest.png');
        
        // Items
        this.load.image('sword', 'assets/images/items/sword.png');
        this.load.image('staff', 'assets/images/items/staff.png');
        this.load.image('bow', 'assets/images/items/bow.png');
        // Use these as placeholders if specific images aren't available
        this.load.image('armor', 'assets/images/items/staff.png'); // Using staff as placeholder for armor
        this.load.image('ring', 'assets/images/items/bow.png');    // Using bow as placeholder for accessory
        this.load.image('item', 'assets/images/items/sword.png');  // Generic item
    }
} 