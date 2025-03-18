import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { CharacterClass } from '../entities/character.entity';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['Fighter', 'Priest', 'Rogue', 'Archer', 'Wizard'])
  class: CharacterClass;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsOptional()
  skills?: any[];
} 