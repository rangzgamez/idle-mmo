import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BarracksScene } from './scenes/BarracksScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { CombatScene } from './scenes/CombatScene';
import { UIScene } from './scenes/UIScene';
import { InventoryScene } from './scenes/InventoryScene';
import { AuthScene } from './scenes/AuthScene';
import { CharacterCreationScene } from './scenes/CharacterCreationScene';
import { EquipmentScene } from './scenes/EquipmentScene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        AuthScene,
        CharacterCreationScene,
        BarracksScene,
        WorldMapScene,
        CombatScene,
        UIScene,
        InventoryScene,
        EquipmentScene
    ]
};

// Initialize the game
window.onload = () => {
    const game = new Phaser.Game(config);
}; 