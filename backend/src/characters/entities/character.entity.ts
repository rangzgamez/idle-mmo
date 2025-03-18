import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';

export type CharacterClass = 'Fighter' | 'Priest' | 'Rogue' | 'Archer' | 'Wizard';

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: ['Fighter', 'Priest', 'Rogue', 'Archer', 'Wizard'],
    default: 'Fighter'
  })
  class: CharacterClass;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 100 })
  hp: number;

  @Column({ default: 100 })
  maxHp: number;

  @Column({ default: 50 })
  mp: number;

  @Column({ default: 50 })
  maxMp: number;

  @Column({ default: 0 })
  exp: number;

  @Column('simple-json', { nullable: true })
  skills: {
    id: string;
    name: string;
    description: string;
    mpCost: number;
    cooldown: number;
    damage?: number;
    healing?: number;
  }[];
  
  @Column('simple-json', { nullable: true })
  equipment?: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };

  @ManyToOne(() => User, user => user.characters)
  user: User;

  @ManyToMany(() => Item)
  @JoinTable()
  items: Item[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 