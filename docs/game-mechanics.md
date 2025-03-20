# Game Mechanics

This document explains the core game mechanics and systems in the Idle MMO game.

## Character System

### Character Classes

Characters in the game belong to one of three classes:

1. **Warrior**
   - High HP and defense
   - Melee combat focused
   - Special ability: Berserk (increased damage at low health)

2. **Mage**
   - Low HP but high magic attack
   - Ranged spell combat
   - Special ability: Mana Shield (converts damage to mana)

3. **Archer**
   - Medium HP and high evasion
   - Ranged physical combat
   - Special ability: Critical Shot (increased critical hit chance)

### Character Attributes

Each character has the following primary attributes:

- **Strength** - Increases physical damage and carrying capacity
- **Intelligence** - Increases magic damage and mana pool
- **Dexterity** - Increases attack speed and evasion
- **Vitality** - Increases health points and health regeneration

### Derived Statistics

From the primary attributes, the following statistics are derived:

- **Health Points (HP)** = Base HP + (Vitality × 10)
- **Mana Points (MP)** = Base MP + (Intelligence × 5)
- **Physical Attack** = Base Attack + (Strength × 2)
- **Magic Attack** = Base Magic + (Intelligence × 2)
- **Defense** = Base Defense + (Strength × 0.5) + (Vitality × 0.5)
- **Evasion** = Base Evasion + (Dexterity × 1)
- **Critical Hit Chance** = Base Critical + (Dexterity × 0.1)%

## Equipment System

### Item Types

The game features three main types of equipment:

1. **Weapons**
   - Swords (Warrior)
   - Staffs (Mage)
   - Bows (Archer)

2. **Armor**
   - Light Armor (Archer)
   - Medium Armor (Warrior)
   - Robes (Mage)

3. **Accessories**
   - Rings
   - Amulets
   - Trinkets

### Item Quality

Items come in different quality tiers:

- **Common** (White) - Basic stats
- **Uncommon** (Green) - Better stats, 1 bonus attribute
- **Rare** (Blue) - Good stats, 2 bonus attributes
- **Epic** (Purple) - Excellent stats, 3 bonus attributes
- **Legendary** (Orange) - Best stats, 3-4 bonus attributes and unique effect

### Item Level

Item level determines the base stats of an item. Higher level items have better base statistics.

### Item Attributes

Items can have various attributes that enhance character statistics:

- Strength +X
- Intelligence +X
- Dexterity +X
- Vitality +X
- Critical Hit Chance +X%
- Attack Speed +X%
- Health Regeneration +X
- Mana Regeneration +X

### Equipment Management

The inventory system allows players to:

- View all items owned by the player
- Equip items to any compatible character
- Unequip items from characters
- Sort items by type, level, or quality
- Compare item stats with currently equipped items

## Combat System

### Combat Flow

Combat follows these steps:

1. Initiative is determined by character speed
2. Characters take turns performing actions
3. Actions include attacking, using skills, or using items
4. Combat continues until one side is defeated

### Damage Calculation

Physical damage is calculated as:

```
Damage = (Attacker's Physical Attack - Defender's Defense) × Random(0.9, 1.1)
```

Magical damage is calculated as:

```
Damage = (Attacker's Magic Attack - Defender's Magic Resistance) × Random(0.9, 1.1)
```

Critical hits multiply damage by 1.5x.

### Combat Rewards

After successful combat, characters receive:

- Experience points
- Gold
- Potential item drops

## Progression System

### Experience and Leveling

Characters gain experience from:

- Defeating enemies
- Completing quests
- Idle progression

The experience required for each level follows this formula:

```
XP for Level N = 100 × (N^1.5)
```

### Level Rewards

When a character levels up, they receive:

- 5 attribute points to distribute
- Increased base statistics
- New skills (at specific level thresholds)

### Idle Progression

When players are offline, characters continue to:

- Gain experience at a reduced rate
- Collect resources
- Earn gold

The idle progression rate is 50% of active play.

## Economy System

### Currency

The main currency is Gold, which can be used for:

- Buying equipment from shops
- Upgrading items
- Training skills
- Crafting materials

### Trading

Players can list items on the marketplace for other players to purchase.

## Crafting System

### Materials

Materials are gathered through:

- Resource nodes in the world
- Enemy drops
- Purchasing from NPCs

### Recipes

Crafting recipes combine materials to create:

- Weapons
- Armor
- Accessories
- Consumables

### Crafting Success

Crafting has a base success rate, modified by the character's crafting skill.

## Skill System

### Active Skills

Active skills require mana and have cooldowns:

- **Warrior**
  - Cleave (area damage)
  - Shield Bash (stun)
  - Taunt (aggro management)

- **Mage**
  - Fireball (single-target damage)
  - Frost Nova (area slow)
  - Teleport (movement)

- **Archer**
  - Aimed Shot (high damage)
  - Volley (area damage)
  - Trap (control)

### Passive Skills

Passive skills provide permanent bonuses:

- **Warrior**
  - Toughness (increased HP)
  - Weapon Mastery (increased damage)

- **Mage**
  - Mana Flow (increased MP regeneration)
  - Spell Penetration (ignore magic resistance)

- **Archer**
  - Eagle Eye (increased critical chance)
  - Quick Draw (increased attack speed)

## Quest System

### Quest Types

- **Main Quests** - Story-driven quests that advance the game narrative
- **Side Quests** - Optional quests that provide additional rewards
- **Daily Quests** - Repeatable quests that reset daily
- **Achievement Quests** - Long-term goals with significant rewards

### Quest Rewards

Quests can reward:

- Experience
- Gold
- Items
- Reputation with factions
- Skill points

## World Map

### Zones

The game world is divided into zones with varying difficulty:

1. **Beginner Zones** (Level 1-10)
   - Low-level enemies
   - Basic resources
   - Introductory quests

2. **Intermediate Zones** (Level 11-30)
   - Medium difficulty enemies
   - Better resources
   - More complex quests

3. **Advanced Zones** (Level 31-50)
   - Challenging enemies
   - Rare resources
   - Epic quest lines

4. **Endgame Zones** (Level 50+)
   - Boss encounters
   - Legendary materials
   - Raid content

### Fast Travel

Players can fast travel between discovered locations using:

- Teleport stones (consumable items)
- Permanent teleport points (unlocked through quests)

## Social Systems

### Guilds

Players can form or join guilds to:

- Tackle guild-exclusive content
- Share resources
- Gain guild-wide buffs
- Compete in guild rankings

### Friendships

Players can add friends to:

- See when they're online
- Send direct messages
- Trade items with reduced fees
- Invite to parties

## Upcoming Features

Future updates will include:

- **Pet System** - Companions that assist in combat and gathering
- **Housing** - Customizable player homes with utility benefits
- **Dungeons** - Instanced challenges with unique rewards
- **PvP Arena** - Competitive player versus player combat 