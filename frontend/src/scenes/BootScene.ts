import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        // Preload any assets needed for the loading screen
        console.log('BootScene preload');
    }

    create(): void {
        // Transition to the loading scene once boot is complete
        console.log('BootScene starting AuthScene');
        this.scene.start('AuthScene');
    }
} 