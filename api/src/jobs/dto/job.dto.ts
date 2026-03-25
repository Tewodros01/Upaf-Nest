import {
  IsString, IsOptional, IsNumber, IsEnum, IsBoolean,
  IsDateString, IsArray, Min,
} from 'class-validator';
import { JobType, JobStatus, WorkMode, ExperienceLevel } from 'generated/prisma/client';

export class CreateJobDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsEnum(JobType) type: JobType;
  @IsString() requirements: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsEnum(WorkMode) workMode?: WorkMode;
  @IsOptional() @IsEnum(ExperienceLevel) experience?: ExperienceLevel;
  @IsOptional() @IsNumber() @Min(0) salaryMin?: number;
  @IsOptional() @IsNumber() @Min(0) salaryMax?: number;
  @IsOptional() @IsDateString() deadline?: string;
  @IsOptional() @IsString() benefits?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) skillIds?: string[];
}

export class UpdateJobDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
  @IsOptional() @IsString() requirements?: string;
  @IsOptional() @IsBoolean() isSponsored?: boolean;
}

export class ApplyJobDto {
  @IsOptional() @IsString() coverLetter?: string;
  @IsOptional() @IsString() resume?: string;
  @IsOptional() @IsString() portfolio?: string;
}

export class UpdateApplicationDto {
  @IsString() status: string;
  @IsOptional() @IsString() notes?: string;
}

export class JobQueryDto {
  @IsOptional() @IsEnum(JobType) type?: JobType;
  @IsOptional() @IsEnum(WorkMode) workMode?: WorkMode;
  @IsOptional() @IsEnum(ExperienceLevel) experience?: ExperienceLevel;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() skillId?: string;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}
