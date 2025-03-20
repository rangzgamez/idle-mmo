export type ItemType = 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Material' | 'Misc';
export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EquipmentSlot = 'Weapon' | 'Armor' | 'Accessory';

export interface Item {
    id: string;
    name: string;
    description?: string;
    type: ItemType;
    rarity: ItemRarity;
    level: number;
    stats?: {
        attack?: number;
        defense?: number;
        hp?: number;
        mp?: number;
    };
    value: number;
    equipped?: boolean;
    equippedBy?: string; // Character ID
    equippedSlot?: EquipmentSlot; // Which slot the item is equipped in
}

export interface Inventory {
    items: Item[];
    capacity: number;
} 