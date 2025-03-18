import { ItemType, ItemRarity } from '../entities/item.entity';
export declare class CreateItemDto {
    name: string;
    description?: string;
    type: ItemType;
    rarity: ItemRarity;
    level?: number;
    stats?: {
        attack?: number;
        defense?: number;
        hp?: number;
        mp?: number;
    };
    value?: number;
}
