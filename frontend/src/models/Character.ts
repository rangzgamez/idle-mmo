export interface Skill {
    id: string;
    name: string;
    description: string;
    mpCost: number;
    cooldown: number;
    damage?: number;
    healing?: number;
}

export type CharacterClass = 'Fighter' | 'Priest' | 'Rogue' | 'Archer' | 'Wizard';

export interface CharacterEquipment {
    weapon?: string;
    armor?: string;
    accessory?: string;
}

export interface Character {
    id: string;
    name: string;
    class: CharacterClass | string; // Using string to allow for future unlockable classes
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    exp: number;
    skills: Skill[];
    equipment?: CharacterEquipment;
} 