export type ItemType = 'Weapon' | 'Armor' | 'Accessory' | 'Material' | 'Consumable';
export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export declare class Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    level: number;
    stats: {
        attack?: number;
        defense?: number;
        hp?: number;
        mp?: number;
    };
    value: number;
    createdAt: Date;
    updatedAt: Date;
}
