import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProjectStatus } from 'generated/prisma/client';

export class CreateProjectDto {
  @IsString() title!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsString() repoUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) skillIds?: string[];
}

export class UpdateProjectDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsString() repoUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @IsArray() @IsString({ each: true }) skillIds?: string[];
}

export class ProjectQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() skillId?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class AddCommentDto {
  @IsString() content!: string;
}
