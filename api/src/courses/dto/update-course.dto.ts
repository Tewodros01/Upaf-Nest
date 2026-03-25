import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { SkillLevel } from "generated/prisma/enums";

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number;

    @IsOptional()
    @IsEnum(SkillLevel)
    level?: SkillLevel;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    skillIds: string[];
    
    @IsOptional()
    content?: any;
}
