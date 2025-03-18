import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ItemType, ItemRarity } from '../entities/item.entity';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['Weapon', 'Armor', 'Accessory', 'Material', 'Consumable'])
  type: ItemType;

  @IsEnum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'])
  rarity: ItemRarity;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsObject()
  @IsOptional()
  stats?: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
  };

  @IsNumber()
  @IsOptional()
  value?: number;
} 