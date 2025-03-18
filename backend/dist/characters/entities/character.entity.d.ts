import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';
export type CharacterClass = 'Fighter' | 'Priest' | 'Rogue' | 'Archer' | 'Wizard';
export declare class Character {
    id: string;
    name: string;
    class: CharacterClass;
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    exp: number;
    skills: {
        id: string;
        name: string;
        description: string;
        mpCost: number;
        cooldown: number;
        damage?: number;
        healing?: number;
    }[];
    equipment?: {
        weapon?: string;
        armor?: string;
        accessory?: string;
    };
    user: User;
    items: Item[];
    createdAt: Date;
    updatedAt: Date;
}
