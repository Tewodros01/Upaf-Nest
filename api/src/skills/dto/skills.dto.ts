import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { SkillLevel } from 'generated/prisma/client';

export class CreateSkillDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddUserSkillDto {
  @IsString()
  skillId: string;

  @IsEnum(SkillLevel)
  level: SkillLevel;
}

export class UpdateUserSkillDto {
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}