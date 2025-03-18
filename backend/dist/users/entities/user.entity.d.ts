import { Character } from '../../characters/entities/character.entity';
export declare class User {
    id: string;
    username: string;
    password: string;
    isActive: boolean;
    characters: Character[];
    createdAt: Date;
    updatedAt: Date;
}
