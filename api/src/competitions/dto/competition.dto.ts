import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CompetitionStatus, CompetitionType } from 'generated/prisma/client';

export class CreateCompetitionDto {
  @IsString() title!: string;
  @IsString() description!: string;
  @IsEnum(CompetitionType) type!: CompetitionType;
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsNumber() @Min(0) prize?: number;
  @IsOptional() @IsNumber() @Min(0) entryFee?: number;
  @IsOptional() @IsNumber() @Min(1) maxParticipants?: number;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsString() rules?: string;
  @IsOptional() @IsBoolean() isSponsored?: boolean;
  @IsOptional() @IsString() sponsor?: string;
}

export class UpdateCompetitionDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(CompetitionStatus) status?: CompetitionStatus;
  @IsOptional() @IsNumber() @Min(0) prize?: number;
  @IsOptional() @IsString() rules?: string;
  @IsOptional() @IsBoolean() isSponsored?: boolean;
}

export class SubmitEntryDto {
  @IsOptional() @IsString() submissionUrl?: string;
  @IsOptional() @IsString() description?: string;
}

export class ScoreEntryDto {
  @IsNumber() @Min(0) @Max(100) score!: number;
  @IsOptional() @IsNumber() rank?: number;
}

export class CompetitionQueryDto {
  @IsOptional() @IsEnum(CompetitionType) type?: CompetitionType;
  @IsOptional() @IsEnum(CompetitionStatus) status?: CompetitionStatus;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(50) limit?: number;
}
