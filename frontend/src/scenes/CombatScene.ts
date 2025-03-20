import Phaser from 'phaser';
import { Character, Skill } from '../models/Character';
import { apiService } from '../services/api.service';
import { Item, ItemType, ItemRarity } from '../models/Item';

interface Enemy {
    id: string;
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    damage: number;
    exp: number;
    spriteKey: string;
    speed: number;
    attackTimer: number;
    attackCooldown: number;
    state: 'idle' | 'moving' | 'attacking' | 'returning';
    target?: CharacterEntity;
}

interface Zone {
    id: string;
    name: string;
    levelRange: string;
    position: { x: number, y: number };
    size: number;
    color: number;
}

interface CharacterEntity {
    character: Character;
    sprite: Phaser.Physics.Arcade.Sprite;
    healthBar: Phaser.GameObjects.Graphics;
    mpBar: Phaser.GameObjects.Graphics;
    target?: EnemyEntity;
    homePosition: Phaser.Math.Vector2;
    state: 'idle' | 'moving' | 'attacking' | 'returning';
    attackTimer: number;
    attackCooldown: number;
    skillCooldowns: Map<string, number>;
    position: number;
    lastActionTime: number;
    active: boolean;
}

interface EnemyEntity {
    enemy: Enemy;
    sprite: Phaser.Physics.Arcade.Sprite;
    healthBar: Phaser.GameObjects.Graphics;
    active: boolean;
}

export class CombatScene extends Phaser.Scene {
    private characters: Character[] = [];
    private characterEntities: CharacterEntity[] = [];
    private enemyEntities: EnemyEntity[] = [];
    private zone!: Zone;
    private spawnTimer: number = 0;
    private maxEnemies: number = 10;
    private enemySpawnRate: number = 3000; // ms
    private skillButtons: Phaser.GameObjects.Container[] = [];
    private isEnding: boolean = false;
    private musicPlaying: Phaser.Sound.BaseSound | null = null;
    private enemySpawnTimer: number = 0;
    private enemiesDefeated: number = 0;
    
    // Camera control properties
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private cameraSpeed: number = 10;
    private characterMovementSpeed: number = 200; // Faster movement speed

    // Add a Misc category to the loot items
    private lootItems: Record<ItemType, string[]> = {
        'Weapon': ['Rusty Sword', 'Iron Dagger', 'Steel Axe', 'Bronze Mace'],
        'Armor': ['Leather Vest', 'Chain Mail', 'Iron Shield', 'Steel Helmet'],
        'Accessory': ['Silver Ring', 'Gold Amulet', 'Bronze Bracelet', 'Lucky Charm'],
        'Material': ['Iron Ore', 'Wood', 'Leather', 'Cloth', 'Stone'],
        'Consumable': ['Health Potion', 'Mana Potion', 'Antidote', 'Elixir'],
        'Misc': ['Old Coin', 'Strange Crystal', 'Mysterious Rune', 'Goblin Tooth']
    };

    constructor() {
        super('CombatScene');
    }

    init(data: { selectedCharacters: Character[], zone: Zone }): void {
        this.characters = data.selectedCharacters;
        this.zone = data.zone;

        // Reset entities
        this.characterEntities = [];
        this.enemyEntities = [];
        this.skillButtons = [];
    }

    create(): void {
        const { width, height } = this.cameras.main;
        
        // Create a larger world for camera movement
        const worldWidth = width * 2;
        const worldHeight = height * 2;
        
        // Set world bounds for camera
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Create zone background based on zone type
        this.createBackground(worldWidth, worldHeight);

        // Show zone name - fixed to camera
        const zoneTitle = this.add.text(width / 2, 30, this.zone.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        zoneTitle.setScrollFactor(0); // Fixed to camera

        // Create characters in triangle formation
        this.createCharacters();
        
        // Center camera on characters initially
        this.centerCameraOnCharacters();

        // Setup enemy spawning
        this.time.addEvent({
            delay: this.enemySpawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Return to world map button - fixed to camera
        const returnButton = this.add.text(100, height - 50, 'Return to World Map', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        returnButton.setScrollFactor(0); // Fixed to camera

        returnButton.on('pointerdown', () => {
            this.scene.start('WorldMapScene', { selectedCharacters: this.characters });
        });

        // Camera controls info - fixed to camera
        const controlsText = this.add.text(width / 2, height - 20, 
            'Use ARROW KEYS to move camera | SPACEBAR to center on characters | LEFT CLICK to move characters', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        controlsText.setScrollFactor(0); // Fixed to camera

        // Setup player input for movement
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.movePartyTo(worldPoint.x, worldPoint.y);
            }
        });
        
        // Setup input for camera controls
        if (this.input && this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        // Create skills UI - fixed to camera
        this.createSkillsUI();

        // Start the UI scene
        this.scene.launch('UIScene', { characters: this.characters });
    }

    update(time: number, delta: number): void {
        // Camera movement with arrow keys
        if (this.cursors) {
            if (this.cursors.left.isDown) {
                this.cameras.main.scrollX -= this.cameraSpeed;
            } else if (this.cursors.right.isDown) {
                this.cameras.main.scrollX += this.cameraSpeed;
            }
            
            if (this.cursors.up.isDown) {
                this.cameras.main.scrollY -= this.cameraSpeed;
            } else if (this.cursors.down.isDown) {
                this.cameras.main.scrollY += this.cameraSpeed;
            }
        }
        
        // Center camera on characters when spacebar is pressed
        if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.centerCameraOnCharacters();
        }
        
        // Check game state
        this.checkCombatState();
        
        // Skip rest of update if combat is over
        if (this.isEnding) return;
        
        // Update timer for enemy spawning
        this.enemySpawnTimer += delta;
        if (this.enemySpawnTimer >= this.enemySpawnRate) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        // Update all entities
        this.processEntities(delta);
    }
    
    private centerCameraOnCharacters(): void {
        if (this.characterEntities.length === 0) return;
        
        // Calculate the center position of all characters
        let centerX = 0;
        let centerY = 0;
        let activeCharacters = 0;
        
        this.characterEntities.forEach(entity => {
            if (entity.active) {
                centerX += entity.sprite.x;
                centerY += entity.sprite.y;
                activeCharacters++;
            }
        });
        
        if (activeCharacters > 0) {
            centerX /= activeCharacters;
            centerY /= activeCharacters;
            
            // Center the camera on the character group
            this.cameras.main.centerOn(centerX, centerY);
        }
    }

    private checkCombatState(): void {
        // Check if all characters are defeated
        const allCharactersDefeated = this.characterEntities.every(character => !character.active);
        
        // Check if all enemies are defeated and there are enough waves defeated for victory
        const allEnemiesDefeated = this.enemyEntities.length > 0 && 
                                  this.enemyEntities.every(enemy => !enemy.active);
        const sufficientWavesDefeated = this.enemiesDefeated >= 10;
        
        // End combat with victory or defeat
        if (allCharactersDefeated) {
            this.endCombat(false); // Defeat
        } else if (allEnemiesDefeated && sufficientWavesDefeated) {
            this.endCombat(true);  // Victory
        }
    }

    private createBackground(worldWidth: number, worldHeight: number): void {
        // Different background based on zone
        let bgColor = 0x2d8c32; // Default forest green

        switch (this.zone.id) {
            case 'forest':
                bgColor = 0x2d8c32;
                break;
            case 'plains':
                bgColor = 0xa9c94f;
                break;
            case 'mountains':
                bgColor = 0x8c7c6d;
                break;
            case 'desert':
                bgColor = 0xe2d37a;
                break;
            case 'swamp':
                bgColor = 0x4c724a;
                break;
            case 'volcano':
                bgColor = 0xc92c2c;
                break;
        }

        // Base background
        this.add.rectangle(0, 0, worldWidth, worldHeight, bgColor).setOrigin(0);

        // Add some variation based on zone
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, worldWidth);
            const y = Phaser.Math.Between(0, worldHeight);
            const size = Phaser.Math.Between(50, 150);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);

            this.add.circle(x, y, size, 0xffffff, alpha);
        }
    }

    private createCharacters(): void {
        const { width, height } = this.cameras.main;

        // Starting position (center of screen)
        const centerX = width / 2;
        const centerY = height / 2;

        // Triangle formation positions
        const positions = [
            new Phaser.Math.Vector2(centerX, centerY - 50), // Top
            new Phaser.Math.Vector2(centerX - 50, centerY + 50), // Bottom left
            new Phaser.Math.Vector2(centerX + 50, centerY + 50)  // Bottom right
        ];

        // Create character entities
        this.characters.forEach((character, index) => {
            const position = positions[index];

            // Create sprite
            const sprite = this.physics.add.sprite(position.x, position.y, character.class.toLowerCase());
            sprite.setScale(0.8);
            sprite.setCollideWorldBounds(true);

            // Create health and MP bars
            const healthBar = this.add.graphics();
            const mpBar = this.add.graphics();

            // Create character entity
            const characterEntity: CharacterEntity = {
                character,
                sprite,
                healthBar,
                mpBar,
                homePosition: position.clone(),
                state: 'idle',
                attackTimer: 0,
                attackCooldown: character.class === 'Fighter' ? 1000 : 1200, // Fighters attack faster
                skillCooldowns: new Map(),
                position: index,
                lastActionTime: 0,
                active: true
            };

            this.characterEntities.push(characterEntity);
        });
    }

    private processEntities(delta: number): void {
        // Update character behaviors
        this.characterEntities.forEach(entity => {
            if (entity.active) {
                this.updateCharacterBehavior(entity, delta);
                this.updateHealthBar(entity);
            }
        });
        
        // Update enemy behaviors and cleanup dead enemies
        this.enemyEntities = this.enemyEntities.filter(entity => {
            if (entity.active) {
                this.updateEnemyBehavior(entity, delta);
                this.updateHealthBar(entity);
                return true;
            }
            // Remove dead enemy
            entity.sprite.destroy();
            entity.healthBar.destroy();
            this.enemiesDefeated++;
            return false;
        });
    }

    private updateCharacterBehavior(entity: CharacterEntity, delta: number): void {
        // Decrement skill cooldowns
        entity.skillCooldowns.forEach((cooldown, skillId) => {
            if (cooldown > 0) {
                entity.skillCooldowns.set(skillId, cooldown - delta);
            }
        });

        // If character is dead, don't update
        if (entity.character.hp <= 0) {
            entity.sprite.setTint(0xff0000);
            entity.state = 'idle';
            return;
        }

        // Different behavior based on class
        if (entity.character.class === 'Priest') {
            this.updatePriestBehavior(entity, delta);
        } else {
            this.updateCombatantBehavior(entity, delta);
        }
    }

    private updatePriestBehavior(entity: CharacterEntity, delta: number): void {
        // Find hurt allies to heal
        const hurtAlly = this.characterEntities.find(ally =>
            ally.character.hp > 0 &&
            ally.character.hp < ally.character.maxHp * 0.7
        );

        if (hurtAlly) {
            // Decrement attack timer
            entity.attackTimer -= delta;

            if (entity.attackTimer <= 0) {
                // Heal the ally
                this.healCharacter(hurtAlly, 50);

                // Display healing effect
                this.createHealEffect(hurtAlly.sprite.x, hurtAlly.sprite.y);

                // Reset attack timer
                entity.attackTimer = entity.attackCooldown;
            }
        } else {
            // If no one needs healing, follow the party
            this.moveToHomePosition(entity);
        }
    }

    private updateCombatantBehavior(entity: CharacterEntity, delta: number): void {
        switch (entity.state) {
            case 'idle':
                // Find nearest enemy
                const nearestEnemy = this.findNearestEnemy(entity.sprite.x, entity.sprite.y);

                if (nearestEnemy) {
                    entity.target = nearestEnemy;
                    entity.state = 'moving';
                }
                break;

            case 'moving':
                if (!entity.target || !entity.target.active) {
                    // Target is gone, go back to idle
                    entity.state = 'idle';
                    break;
                }

                // Move towards the target
                const targetPos = new Phaser.Math.Vector2(entity.target.sprite.x, entity.target.sprite.y);
                const direction = new Phaser.Math.Vector2(
                    targetPos.x - entity.sprite.x,
                    targetPos.y - entity.sprite.y
                ).normalize();

                // Get distance to target
                const distance = Phaser.Math.Distance.Between(
                    entity.sprite.x, entity.sprite.y,
                    targetPos.x, targetPos.y
                );

                // If close enough to attack
                const attackRange = entity.character.class === 'Archer' || entity.character.class === 'Wizard' ? 200 : 50;

                if (distance <= attackRange) {
                    // Stop and attack
                    entity.sprite.setVelocity(0, 0);
                    entity.state = 'attacking';
                } else {
                    // Check if too far from home position
                    const homeDistance = Phaser.Math.Distance.Between(
                        entity.sprite.x, entity.sprite.y,
                        entity.homePosition.x, entity.homePosition.y
                    );

                    if (homeDistance > 300) {
                        // Too far, return home
                        entity.state = 'returning';
                    } else {
                        // Move towards enemy
                        const speed = 100;
                        entity.sprite.setVelocity(direction.x * speed, direction.y * speed);
                    }
                }
                break;

            case 'attacking':
                if (!entity.target || !entity.target.active) {
                    // Target is gone, go back to idle
                    entity.state = 'idle';
                    entity.sprite.setVelocity(0, 0);
                    break;
                }

                // Get distance to target
                const attackDistance = Phaser.Math.Distance.Between(
                    entity.sprite.x, entity.sprite.y,
                    entity.target.sprite.x, entity.target.sprite.y
                );

                // Check if target moved out of range
                const range = entity.character.class === 'Archer' || entity.character.class === 'Wizard' ? 200 : 50;

                if (attackDistance > range) {
                    // Target moved out of range, chase again
                    entity.state = 'moving';
                    break;
                }

                // Attack the enemy
                entity.attackTimer -= delta;

                if (entity.attackTimer <= 0) {
                    this.attackEnemy(entity, entity.target);
                    entity.attackTimer = entity.attackCooldown;
                }
                break;

            case 'returning':
                // Move back to home position
                this.moveToHomePosition(entity);

                // Check if close enough to home
                const distanceToHome = Phaser.Math.Distance.Between(
                    entity.sprite.x, entity.sprite.y,
                    entity.homePosition.x, entity.homePosition.y
                );

                if (distanceToHome < 10) {
                    entity.sprite.setVelocity(0, 0);
                    entity.state = 'idle';
                }
                break;
        }
    }

    private moveToHomePosition(entity: CharacterEntity): void {
        const direction = new Phaser.Math.Vector2(
            entity.homePosition.x - entity.sprite.x,
            entity.homePosition.y - entity.sprite.y
        ).normalize();

        const speed = 100;
        entity.sprite.setVelocity(direction.x * speed, direction.y * speed);
    }

    private findNearestEnemy(x: number, y: number): EnemyEntity | undefined {
        let nearestEnemy: EnemyEntity | undefined;
        let nearestDistance = Number.MAX_SAFE_INTEGER;

        this.enemyEntities.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        });

        return nearestEnemy;
    }

    private attackEnemy(attacker: CharacterEntity, target: EnemyEntity): void {
        // Calculate damage based on character class
        let damage = 10;

        switch (attacker.character.class) {
            case 'Fighter':
                damage = 15;
                break;
            case 'Rogue':
                damage = 12;
                break;
            case 'Archer':
                damage = 10;
                break;
            case 'Wizard':
                damage = 20;
                break;
        }

        // Apply damage
        target.enemy.hp -= damage;

        // Check if enemy is defeated
        if (target.enemy.hp <= 0) {
            this.defeatEnemy(target, attacker);
        }

        // Create attack effect
        this.createAttackEffect(attacker, target);
    }

    private async defeatEnemy(enemy: EnemyEntity, attacker: CharacterEntity | null): Promise<void> {
        // Mark as inactive
        enemy.active = false;
        
        // Award XP to all characters
        const expPerCharacter = enemy.enemy.exp / this.characterEntities.length;
        
        this.characterEntities.forEach(entity => {
            entity.character.exp += expPerCharacter;
            
            // Check for level up
            this.checkLevelUp(entity.character);
        });
        
        // Generate and spawn loot
        const loot = this.generateLoot(enemy.enemy.level);
        if (loot) {
            this.spawnLoot(enemy.sprite.x, enemy.sprite.y, loot);
        }
    }

    private generateLoot(enemyLevel: number): Item | null {
        // Determine if loot should drop (70% chance)
        if (Math.random() > 0.7) return null;
        
        // Determine rarity based on enemy level and randomness
        let rarity: ItemRarity = 'Common';
        const rarityRoll = Math.random();
        
        if (enemyLevel >= 25 && rarityRoll < 0.05) {
            rarity = 'Legendary';
        } else if (enemyLevel >= 20 && rarityRoll < 0.1) {
            rarity = 'Epic';
        } else if (enemyLevel >= 15 && rarityRoll < 0.2) {
            rarity = 'Rare';
        } else if (enemyLevel >= 10 && rarityRoll < 0.3) {
            rarity = 'Uncommon';
        }
        
        // Determine item type
        const typeRoll = Math.random();
        let type: ItemType;
        
        if (typeRoll < 0.2) {
            type = 'Weapon';
        } else if (typeRoll < 0.4) {
            type = 'Armor';
        } else if (typeRoll < 0.5) {
            type = 'Accessory';
        } else if (typeRoll < 0.8) {
            type = 'Material';
        } else {
            type = 'Consumable';
        }
        
        // Generate item stats based on type, level, and rarity
        let stats: any = {};
        const statMultiplier = this.getRarityMultiplier(rarity);
        
        switch (type) {
            case 'Weapon':
                stats.attack = Math.floor(5 + (enemyLevel * 0.8) * statMultiplier);
                break;
            case 'Armor':
                stats.defense = Math.floor(3 + (enemyLevel * 0.5) * statMultiplier);
                break;
            case 'Accessory':
                if (Math.random() < 0.5) {
                    stats.hp = Math.floor(10 + (enemyLevel * 2) * statMultiplier);
                } else {
                    stats.mp = Math.floor(5 + (enemyLevel * 1.5) * statMultiplier);
                }
                break;
            case 'Consumable':
                if (Math.random() < 0.7) {
                    stats.hp = Math.floor(20 + (enemyLevel * 3) * statMultiplier);
                } else {
                    stats.mp = Math.floor(10 + (enemyLevel * 2) * statMultiplier);
                }
                break;
        }
        
        // Generate item name
        const name = this.generateItemName(type, rarity);
        
        // Generate item value based on rarity and level
        const value = Math.floor(10 * enemyLevel * statMultiplier);
        
        // Create item object
        return {
            id: Date.now().toString(), // Temporary ID until saved to backend
            name,
            description: `A ${rarity.toLowerCase()} ${type.toLowerCase()} found from a level ${enemyLevel} enemy.`,
            type,
            rarity,
            level: Math.max(1, enemyLevel - Math.floor(Math.random() * 3)),
            stats,
            value
        };
    }

    private getRarityMultiplier(rarity: ItemRarity): number {
        switch (rarity) {
            case 'Common': return 1;
            case 'Uncommon': return 1.5;
            case 'Rare': return 2;
            case 'Epic': return 3;
            case 'Legendary': return 5;
            default: return 1;
        }
    }

    private generateItemName(type: ItemType, rarity: ItemRarity): string {
        const prefixes: Record<ItemRarity, string[]> = {
            Common: ['Basic', 'Simple', 'Plain', 'Crude', 'Ordinary'],
            Uncommon: ['Fine', 'Quality', 'Sturdy', 'Reliable', 'Improved'],
            Rare: ['Superior', 'Exceptional', 'Excellent', 'Magnificent', 'Reinforced'],
            Epic: ['Heroic', 'Mythical', 'Legendary', 'Ancient', 'Blessed'],
            Legendary: ['Divine', 'Godly', 'Celestial', 'Transcendent', 'Ultimate']
        };
        
        const typeNames: Record<ItemType, string[]> = {
            Weapon: ['Sword', 'Axe', 'Mace', 'Dagger', 'Staff', 'Wand', 'Bow'],
            Armor: ['Plate', 'Mail', 'Leather Armor', 'Robe', 'Shield', 'Helmet'],
            Accessory: ['Ring', 'Amulet', 'Bracelet', 'Charm', 'Talisman', 'Belt'],
            Material: ['Ore', 'Hide', 'Cloth', 'Crystal', 'Essence', 'Wood', 'Stone'],
            Consumable: ['Potion', 'Elixir', 'Scroll', 'Food', 'Tonic'],
            Misc: ['Trinket', 'Relic', 'Artifact', 'Trophy', 'Curio', 'Memento']
        };
        
        const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
        const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
        
        return `${prefix} ${typeName}`;
    }

    private spawnLoot(x: number, y: number, item: Item): void {
        // Determine loot color based on rarity
        let lootColor: number;
        switch (item.rarity) {
            case 'Common': lootColor = 0xaaaaaa; break;
            case 'Uncommon': lootColor = 0x00cc00; break;
            case 'Rare': lootColor = 0x0099ff; break;
            case 'Epic': lootColor = 0xcc00ff; break;
            case 'Legendary': lootColor = 0xffaa00; break;
            default: lootColor = 0xaaaaaa;
        }
        
        // Create loot sprite
        const loot = this.add.circle(x, y, 10, lootColor);
        
        // Make it interactive
        loot.setInteractive({ useHandCursor: true });
        
        // Add hover effect
        loot.on('pointerover', () => {
            loot.setStrokeStyle(2, 0xffffff);
            
            // Show tooltip with item info
            const tooltipBg = this.add.rectangle(x, y - 40, 150, 80, 0x000000, 0.8);
            tooltipBg.setStrokeStyle(1, lootColor);
            
            const tooltipText = this.add.text(x, y - 40, 
                `${item.name}\n${item.rarity} ${item.type}\nLevel ${item.level}`, {
                fontSize: '12px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            loot.setData('tooltip', [tooltipBg, tooltipText]);
        });
        
        loot.on('pointerout', () => {
            loot.setStrokeStyle();
            
            // Remove tooltip
            this.removeTooltip(loot);
        });
        
        // Add click to collect
        loot.on('pointerdown', async () => {
            // Find character with available inventory space
            const character = this.characters[0]; // For simplicity, add to first character
            
            try {
                // Save item to server and add to character's inventory
                if (character && character.id) {
                    // Create collection animation
                    this.tweens.add({
                        targets: loot,
                        alpha: 0,
                        scale: 0.5,
                        duration: 200,
                        onComplete: async () => {
                            // Remove tooltip if still showing
                            this.removeTooltip(loot);
                            
                            // Destroy the loot sprite
                            loot.destroy();
                            
                            try {
                                // Create item on server and add to character's inventory
                                const savedItem = await apiService.createItemForCharacter(character.id, item);
                                
                                // Show collection message
                                const collectionText = this.add.text(x, y, `${item.name} collected!`, {
                                    fontSize: '14px',
                                    color: '#ffffff'
                                }).setOrigin(0.5);
                                
                                this.tweens.add({
                                    targets: collectionText,
                                    y: y - 50,
                                    alpha: 0,
                                    duration: 1000,
                                    onComplete: () => {
                                        collectionText.destroy();
                                    }
                                });
                            } catch (error) {
                                console.error('Failed to save item:', error);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to collect item:', error);
            }
        });
    }
    
    // Helper method to safely remove tooltips
    private removeTooltip(gameObject: Phaser.GameObjects.GameObject): void {
        const tooltipElements = gameObject.getData('tooltip');
        if (tooltipElements && Array.isArray(tooltipElements)) {
            tooltipElements.forEach((element: Phaser.GameObjects.GameObject) => {
                if (element) {
                    element.destroy();
                }
            });
            gameObject.setData('tooltip', null);
        }
    }

    private checkLevelUp(character: Character): void {
        // Simple level up formula: 100 * level
        const expNeeded = 100 * character.level;

        if (character.exp >= expNeeded) {
            character.level++;
            character.exp -= expNeeded;

            // HP and MP stat modifiers for each class
            const classStats = {
                'Fighter': { hpPerLevel: 20, mpPerLevel: 5 },
                'Priest': { hpPerLevel: 10, mpPerLevel: 25 },
                'Rogue': { hpPerLevel: 15, mpPerLevel: 10 },
                'Archer': { hpPerLevel: 12, mpPerLevel: 15 },
                'Wizard': { hpPerLevel: 8, mpPerLevel: 30 }
            };
            
            // Get the stats for this character's class
            const stats = classStats[character.class as keyof typeof classStats] || 
                          { hpPerLevel: 15, mpPerLevel: 10 }; // Default values if class not found
            
            // Increase stats based on class
            character.maxHp += stats.hpPerLevel;
            character.hp = character.maxHp; // Fully heal on level up
            character.maxMp += stats.mpPerLevel;
            character.mp = character.maxMp; // Fully restore MP on level up

            // Display level up effect
            const entity = this.characterEntities.find(e => e.character.id === character.id);
            if (entity) {
                this.createLevelUpEffect(entity.sprite.x, entity.sprite.y);
            }
        }
    }

    private spawnEnemy(): void {
        if (this.enemyEntities.length >= this.maxEnemies) {
            return;
        }

        const { width, height } = this.cameras.main;

        // Spawn positions away from characters
        let x: number = 0;
        let y: number = 0;
        let validPosition = false;

        while (!validPosition) {
            x = Phaser.Math.Between(100, width - 100);
            y = Phaser.Math.Between(100, height - 100);

            // Check if far enough from all characters
            validPosition = this.characterEntities.every(entity => {
                const distance = Phaser.Math.Distance.Between(x, y, entity.sprite.x, entity.sprite.y);
                return distance > 300;
            });
        }

        // Get level range for the zone
        const levelRange = this.zone.levelRange.split('-').map(Number);
        const enemyLevel = Phaser.Math.Between(levelRange[0], levelRange[1]);

        // Create enemy
        const enemy: Enemy = {
            id: Date.now().toString(),
            name: `Enemy Lvl ${enemyLevel}`,
            level: enemyLevel,
            hp: 50 + (enemyLevel * 10),
            maxHp: 50 + (enemyLevel * 10),
            damage: 5 + (enemyLevel * 2),
            exp: 20 + (enemyLevel * 5),
            spriteKey: `enemy${Phaser.Math.Between(1, 3)}`,
            speed: Phaser.Math.Between(50, 80),
            attackTimer: 0,
            attackCooldown: 2000,
            state: 'idle'
        };

        // Create sprite
        const sprite = this.physics.add.sprite(x!, y!, enemy.spriteKey);
        sprite.setScale(0.8);

        // Create health bar
        const healthBar = this.add.graphics();

        // Create enemy entity
        const enemyEntity: EnemyEntity = {
            enemy,
            sprite,
            healthBar,
            active: true
        };

        this.enemyEntities.push(enemyEntity);
    }

    private updateHealthBar(entity: CharacterEntity | EnemyEntity): void {
        const bar = entity.healthBar;
        bar.clear();

        const width = 50;
        const height = 6;

        const x = entity.sprite.x - width / 2;
        const y = entity.sprite.y - entity.sprite.height / 2 - 10;

        // Is this a character or enemy?
        const isCharacter = 'character' in entity;
        const current = isCharacter ? entity.character.hp : entity.enemy.hp;
        const max = isCharacter ? entity.character.maxHp : entity.enemy.maxHp;

        // Background
        bar.fillStyle(0x000000, 0.8);
        bar.fillRect(x, y, width, height);

        // Fill amount
        const fillWidth = Math.max(0, width * (current / max));
        bar.fillStyle(isCharacter ? 0x00ff00 : 0xff0000, 1);
        bar.fillRect(x, y, fillWidth, height);

        // Add MP bar for characters
        if (isCharacter) {
            const mpBar = (entity as CharacterEntity).mpBar;
            mpBar.clear();

            const mpY = y + height + 1;

            // Background
            mpBar.fillStyle(0x000000, 0.8);
            mpBar.fillRect(x, mpY, width, height);

            // Fill amount
            const mpFillWidth = Math.max(0, width * (entity.character.mp / entity.character.maxMp));
            mpBar.fillStyle(0x0000ff, 1);
            mpBar.fillRect(x, mpY, mpFillWidth, height);
        }
    }

    private createAttackEffect(attacker: CharacterEntity, target: EnemyEntity): void {
        const isRanged = attacker.character.class === 'Archer' || attacker.character.class === 'Wizard';

        if (isRanged) {
            // Create projectile
            const color = attacker.character.class === 'Wizard' ? 0x9900ff : 0xffff00;
            const projectile = this.add.circle(attacker.sprite.x, attacker.sprite.y, 5, color);

            // Animate projectile
            this.tweens.add({
                targets: projectile,
                x: target.sprite.x,
                y: target.sprite.y,
                duration: 300,
                onComplete: () => {
                    projectile.destroy();

                    // Create impact effect
                    const impact = this.add.circle(target.sprite.x, target.sprite.y, 20, color, 0.7);
                    this.tweens.add({
                        targets: impact,
                        alpha: 0,
                        scale: 0.5,
                        duration: 200,
                        onComplete: () => {
                            impact.destroy();
                        }
                    });
                }
            });
        } else {
            // Melee swing effect
            const swing = this.add.arc(target.sprite.x, target.sprite.y, 30, 0, 270, false, 0xffffff, 0.7);

            this.tweens.add({
                targets: swing,
                alpha: 0,
                scale: 1.2,
                duration: 200,
                onComplete: () => {
                    swing.destroy();
                }
            });
        }
    }

    private createHealEffect(x: number, y: number): void {
        // Create particles for healing
        const particles = this.add.particles(x, y, 'green', {
            speed: 100,
            lifespan: 800,
            quantity: 20,
            scale: { start: 0.1, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        // Clean up after animation
        this.time.delayedCall(800, () => {
            particles.destroy();
        });
    }

    private createLevelUpEffect(x: number, y: number): void {
        // Create level up text
        const levelUpText = this.add.text(x, y - 50, 'LEVEL UP!', {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Animate text
        this.tweens.add({
            targets: levelUpText,
            y: y - 100,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
    }

    private healCharacter(target: CharacterEntity, amount: number): void {
        target.character.hp = Math.min(target.character.maxHp, target.character.hp + amount);
    }

    private movePartyTo(x: number, y: number): void {
        // Update home positions to form triangle around clicked position
        const positions = [
            new Phaser.Math.Vector2(x, y - 70), // Top
            new Phaser.Math.Vector2(x - 70, y + 70), // Bottom left
            new Phaser.Math.Vector2(x + 70, y + 70)  // Bottom right
        ];

        this.characterEntities.forEach((entity, index) => {
            if (!entity.active) return; // Skip inactive characters
            
            const posIndex = index % positions.length;
            entity.homePosition = positions[posIndex];
            entity.state = 'returning';
            
            // Set the character's speed based on the characterMovementSpeed property
            const distance = Phaser.Math.Distance.Between(
                entity.sprite.x, 
                entity.sprite.y, 
                entity.homePosition.x, 
                entity.homePosition.y
            );
            
            // Calculate duration based on distance and speed
            const duration = distance / this.characterMovementSpeed * 1000; // Convert to milliseconds
            
            // Move character with tween for smoother movement
            this.tweens.add({
                targets: entity.sprite,
                x: entity.homePosition.x,
                y: entity.homePosition.y,
                duration: duration,
                ease: 'Power2'
            });
        });
    }

    private createSkillsUI(): void {
        const { width, height } = this.cameras.main;

        this.characters.forEach((character, index) => {
            // Only create skill buttons for characters with skills
            if (character.skills && character.skills.length > 0) {
                // Create container for this character's skills
                const container = this.add.container(width - 150, 150 + index * 150);
                container.setScrollFactor(0); // Fixed to camera
                
                // Create title for the character
                const titleText = this.add.text(0, -40, `${character.name}'s Skills`, {
                    fontSize: '14px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                container.add(titleText);
                
                // Create skill buttons
                character.skills.forEach((skill, skillIndex) => {
                    const button = this.add.rectangle(0, skillIndex * 30, 150, 25, 0x333399, 0.8)
                        .setStrokeStyle(1, 0x6666cc);
                    container.add(button);
                    
                    const text = this.add.text(0, skillIndex * 30, skill.name, {
                        fontSize: '12px',
                        color: '#ffffff'
                    }).setOrigin(0.5);
                    container.add(text);
                    
                    // Make button interactive
                    button.setInteractive({ useHandCursor: true });
                    button.on('pointerdown', () => {
                        this.useSkill(character, skill);
                    });
                    
                    button.on('pointerover', () => {
                        button.setFillStyle(0x5555aa);
                    });
                    
                    button.on('pointerout', () => {
                        button.setFillStyle(0x333399);
                    });
                });
                
                this.skillButtons.push(container);
            }
        });
    }

    private useSkill(character: Character, skill: Skill): void {
        // Find the character entity
        const entity = this.characterEntities.find(e => e.character.id === character.id);

        if (!entity) return;

        // Check if skill is on cooldown
        const cooldown = entity.skillCooldowns.get(skill.id) || 0;
        if (cooldown > 0) return;

        // Check if character has enough MP
        if (character.mp < skill.mpCost) return;

        // Use MP
        character.mp -= skill.mpCost;

        // Set cooldown
        entity.skillCooldowns.set(skill.id, skill.cooldown);

        // Apply skill effect
        if (skill.damage && skill.damage > 0) {
            // Damaging skill
            this.enemyEntities.forEach(enemy => {
                if (enemy.active) {
                    const distance = Phaser.Math.Distance.Between(
                        entity.sprite.x, entity.sprite.y,
                        enemy.sprite.x, enemy.sprite.y
                    );

                    // Check if enemy is in range (300px for all skills for simplicity)
                    if (distance <= 300) {
                        enemy.enemy.hp -= skill.damage!;

                        // Check if enemy is defeated
                        if (enemy.enemy.hp <= 0) {
                            this.defeatEnemy(enemy, entity);
                        }

                        // Create effect
                        this.createSkillEffect(enemy.sprite.x, enemy.sprite.y);
                    }
                }
            });
        } else if (skill.healing && skill.healing > 0) {
            // Healing skill
            this.characterEntities.forEach(target => {
                if (target.character.hp > 0) {
                    target.character.hp = Math.min(
                        target.character.maxHp,
                        target.character.hp + skill.healing!
                    );

                    // Create heal effect
                    this.createHealEffect(target.sprite.x, target.sprite.y);
                }
            });
        }
    }

    private createSkillEffect(x: number, y: number): void {
        // Create explosion effect
        const explosion = this.add.circle(x, y, 50, 0xff0000, 0.7);

        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
    }

    private updateEnemyBehavior(enemy: EnemyEntity, delta: number): void {
        // Don't update behavior if enemy is dead
        if (enemy.enemy.hp <= 0) {
            enemy.active = false;
            return;
        }

        // Initialize state if not set
        if (!enemy.enemy.state) {
            enemy.enemy.state = 'idle';
            enemy.enemy.attackTimer = 0;
            enemy.enemy.attackCooldown = 2000; // 2 seconds between attacks
        }

        switch (enemy.enemy.state) {
            case 'idle':
                // Find nearest character to attack
                const nearestCharacter = this.findNearestCharacter(enemy.sprite.x, enemy.sprite.y);

                if (nearestCharacter && nearestCharacter.character.hp > 0) {
                    enemy.enemy.target = nearestCharacter;
                    enemy.enemy.state = 'moving';
                }
                break;

            case 'moving':
                if (!enemy.enemy.target || enemy.enemy.target.character.hp <= 0) {
                    // Target is gone or dead, go back to idle
                    enemy.enemy.state = 'idle';
                    enemy.sprite.setVelocity(0, 0);
                    break;
                }

                // Move towards the target
                const targetPos = new Phaser.Math.Vector2(
                    enemy.enemy.target.sprite.x,
                    enemy.enemy.target.sprite.y
                );

                const direction = new Phaser.Math.Vector2(
                    targetPos.x - enemy.sprite.x,
                    targetPos.y - enemy.sprite.y
                ).normalize();

                // Get distance to target
                const distance = Phaser.Math.Distance.Between(
                    enemy.sprite.x, enemy.sprite.y,
                    targetPos.x, targetPos.y
                );

                // If close enough to attack (melee range for all enemies)
                if (distance <= 50) {
                    // Stop and attack
                    enemy.sprite.setVelocity(0, 0);
                    enemy.enemy.state = 'attacking';
                } else {
                    // Move towards character
                    enemy.sprite.setVelocity(
                        direction.x * enemy.enemy.speed,
                        direction.y * enemy.enemy.speed
                    );
                }
                break;

            case 'attacking':
                if (!enemy.enemy.target || enemy.enemy.target.character.hp <= 0) {
                    // Target is gone or dead, go back to idle
                    enemy.enemy.state = 'idle';
                    enemy.sprite.setVelocity(0, 0);
                    break;
                }

                // Get distance to target
                const attackDistance = Phaser.Math.Distance.Between(
                    enemy.sprite.x, enemy.sprite.y,
                    enemy.enemy.target.sprite.x, enemy.enemy.target.sprite.y
                );

                // Check if target moved out of range
                if (attackDistance > 60) {
                    // Target moved out of range, chase again
                    enemy.enemy.state = 'moving';
                    break;
                }

                // Attack the character
                enemy.enemy.attackTimer -= delta;

                if (enemy.enemy.attackTimer <= 0) {
                    this.enemyAttackCharacter(enemy, enemy.enemy.target);
                    enemy.enemy.attackTimer = enemy.enemy.attackCooldown;
                }
                break;

            default:
                // Reset to idle if in unknown state
                enemy.enemy.state = 'idle';
                break;
        }
    }

    private findNearestCharacter(x: number, y: number): CharacterEntity | undefined {
        let nearestCharacter: CharacterEntity | undefined;
        let nearestDistance = Number.MAX_SAFE_INTEGER;

        this.characterEntities.forEach(character => {
            // Only consider living characters
            if (character.character.hp > 0) {
                const distance = Phaser.Math.Distance.Between(
                    x, y,
                    character.sprite.x, character.sprite.y
                );

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestCharacter = character;
                }
            }
        });

        return nearestCharacter;
    }

    private enemyAttackCharacter(enemy: EnemyEntity, target: CharacterEntity): void {
        // Calculate damage based on enemy level
        const damage = enemy.enemy.damage;

        // Apply damage to character
        target.character.hp = Math.max(0, target.character.hp - damage);

        // Create attack effect
        this.createEnemyAttackEffect(enemy, target);

        // Check if character is defeated
        if (target.character.hp <= 0) {
            // Character is defeated
            target.active = false;
            target.sprite.setTint(0x555555);

            // Play defeated animation (fall down)
            this.tweens.add({
                targets: target.sprite,
                angle: 90,
                duration: 300,
                ease: 'Power2'
            });

            // Check if all characters are defeated
            const allDefeated = this.characterEntities.every(char => !char.active);

            if (allDefeated) {
                // Game over - all characters defeated
                this.time.delayedCall(1000, () => {
                    this.endCombat(false);
                });
            }
        }
    }

    private createEnemyAttackEffect(enemy: EnemyEntity, target: CharacterEntity): void {
        // Create slash effect
        const slash = this.add.arc(
            target.sprite.x,
            target.sprite.y,
            30, 0, 270, false, 0xff0000, 0.7
        );

        // Show damage number
        const damageText = this.add.text(
            target.sprite.x,
            target.sprite.y - 20,
            enemy.enemy.damage.toString(),
            {
                fontSize: '16px',
                color: '#ff0000',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Animate effects
        this.tweens.add({
            targets: [slash, damageText],
            alpha: 0,
            y: '-=30',
            scale: 0.5,
            duration: 500,
            onComplete: () => {
                slash.destroy();
                damageText.destroy();
            }
        });
    }

    private gameOver(): void {
        // Create game over text
        const { width, height } = this.cameras.main;

        const gameOverText = this.add.text(
            width / 2,
            height / 2,
            'GAME OVER',
            {
                fontSize: '48px',
                color: '#ff0000',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Add retry button
        const retryButton = this.add.text(
            width / 2,
            height / 2 + 80,
            'Return to World Map',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryButton.on('pointerdown', () => {
            // Revive characters with 50% HP
            this.characters.forEach(character => {
                character.hp = Math.ceil(character.maxHp * 0.5);
            });

            // Return to world map
            this.scene.start('WorldMapScene', { selectedCharacters: this.characters });
        });
    }

    private async endCombat(victory: boolean): Promise<void> {
        this.isEnding = true;
        
        // End music
        if (this.musicPlaying) {
            this.musicPlaying.stop();
        }
        
        const resultText = victory ? 'Victory!' : 'Defeat!';
        const style = {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: victory ? '#00ff00' : '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        };
        
        // Display result text
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, resultText, style)
            .setOrigin(0.5)
            .setAlpha(0);
        
        // Show result text with animation
        this.tweens.add({
            targets: text,
            alpha: 1,
            y: this.cameras.main.centerY - 100,
            duration: 2000,
            ease: 'Power2'
        });
        
        // Save character progress
        if (victory) {
            try {
                const savingText = this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 50,
                    'Saving progress...',
                    { fontSize: '24px', color: '#ffffff' }
                ).setOrigin(0.5);
                
                const savePromises = this.characters.map(character => {
                    // Prepare character data for update
                    const characterData = {
                        level: character.level,
                        hp: character.hp,
                        maxHp: character.maxHp,
                        mp: character.mp,
                        maxMp: character.maxMp,
                        exp: character.exp
                    };
                    
                    return apiService.updateCharacter(character.id, characterData);
                });
                
                await Promise.all(savePromises);
                savingText.setText('Progress saved!');
            } catch (error) {
                console.error('Failed to save progress:', error);
                this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 50,
                    'Failed to save progress',
                    { fontSize: '24px', color: '#ff0000' }
                ).setOrigin(0.5);
            }
        }
        
        // Create return button
        const returnButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'Return to World Map',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { left: 15, right: 15, top: 10, bottom: 10 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => returnButton.setStyle({ color: '#ffff00' }))
        .on('pointerout', () => returnButton.setStyle({ color: '#ffffff' }))
        .on('pointerdown', () => {
            // Return to world map
            this.scene.start('WorldMapScene', { selectedCharacters: this.characters });
        })
        .setAlpha(0);
        
        // Show return button with animation
        this.tweens.add({
            targets: returnButton,
            alpha: 1,
            y: this.cameras.main.centerY + 150,
            duration: 2000,
            ease: 'Power2',
            delay: 1000
        });
    }

    private damageCharacter(character: CharacterEntity, damage: number): void {
        // Apply damage
        character.character.hp = Math.max(0, character.character.hp - damage);
        
        // Create damage text
        this.createDamageText(character.sprite.x, character.sprite.y, damage, 0xff0000);
        
        // Check if defeated
        if (character.character.hp <= 0) {
            character.active = false;
            character.sprite.setTint(0x555555); // Gray tint for defeated
            
            // Play defeated animation (fall down)
            this.tweens.add({
                targets: character.sprite,
                angle: 90,
                duration: 300,
                ease: 'Power2'
            });
        }
    }

    private damageEnemy(enemy: EnemyEntity, damage: number): void {
        // Apply damage
        enemy.enemy.hp = Math.max(0, enemy.enemy.hp - damage);
        
        // Create damage text
        this.createDamageText(enemy.sprite.x, enemy.sprite.y, damage, 0xff0000);
        
        // Check if defeated
        if (enemy.enemy.hp <= 0) {
            enemy.active = false;
            
            // Play defeated animation
            this.tweens.add({
                targets: enemy.sprite,
                alpha: 0,
                scale: 0.8,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    // Get first character as attacker or null if there are none
                    const attacker = this.characterEntities.length > 0 ? this.characterEntities[0] : null;
                    this.defeatEnemy(enemy, attacker);
                }
            });
        }
    }

    private createDamageText(x: number, y: number, amount: number, color: number): void {
        // Create text for damage or healing
        const text = this.add.text(
            x, 
            y - 20, 
            amount.toString(), 
            { 
                fontSize: '24px', 
                fontFamily: 'Arial', 
                color: color === 0xff0000 ? '#ff0000' : '#00ff00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Add animation to make it float up and fade out
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }
} 