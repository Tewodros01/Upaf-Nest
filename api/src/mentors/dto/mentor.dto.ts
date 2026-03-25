import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, Min } from 'class-validator';

export class CreateMentorProfileDto {
  @IsString() expertise: string;
  @IsString() experience: string;
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
  @IsOptional() @IsObject() availability?: Record<string, any>;
}

export class UpdateMentorProfileDto {
  @IsOptional() @IsString() expertise?: string;
  @IsOptional() @IsString() experience?: string;
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
  @IsOptional() @IsObject() availability?: Record<string, any>;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class BookSessionDto {
  @IsString() mentorId: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() scheduledAt: string;
  @IsOptional() @IsNumber() @Min(30) duration?: number;
}

export class ReviewMentorDto {
  @IsNumber() @Min(1) rating: number;
  @IsOptional() @IsString() comment?: string;
}

export class MentorQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsNumber() @Min(0) maxRate?: number;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}
