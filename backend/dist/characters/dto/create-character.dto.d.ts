import { CharacterClass } from '../entities/character.entity';
export declare class CreateCharacterDto {
    name: string;
    class: CharacterClass;
    userId: string;
    skills?: any[];
}
