import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ItemType = 'Weapon' | 'Armor' | 'Accessory' | 'Material' | 'Consumable';
export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: ['Weapon', 'Armor', 'Accessory', 'Material', 'Consumable'],
    default: 'Material'
  })
  type: ItemType;

  @Column({
    type: 'simple-enum',
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
    default: 'Common'
  })
  rarity: ItemRarity;

  @Column({ default: 1 })
  level: number;

  @Column({ nullable: true, type: 'simple-json' })
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
  };

  @Column({ default: 0 })
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 