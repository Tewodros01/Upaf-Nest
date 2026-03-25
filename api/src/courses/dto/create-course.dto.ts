import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { SkillLevel } from "generated/prisma/enums";

export class CreateCourseDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number
    
    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number;

    @IsEnum(SkillLevel)
    level!: SkillLevel;

    @IsArray()
    @IsString({each: true})
    skillIds: string[];

    @IsOptional()
    content?: any;
}

export class ReviewCourseDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class CourseQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(SkillLevel)
    level?: SkillLevel;

    @IsOptional()
    @IsString()
    skillId?: string;

    @IsOptional()
    @IsString()
    instructorId?: string;

    @IsOptional()
    @IsBoolean()
    isFree?: boolean;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsString()
    sortBy?: "rating" | "enrollCount" | "createdAt" | "price";

    @IsOptional()
    @IsString()
    sortOrder?: "asc" | "desc";

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number;
}