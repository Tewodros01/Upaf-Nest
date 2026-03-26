import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsString() userId!: string;
  @IsString() title!: string;
  @IsString() issuer!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() verifyUrl?: string;
  @IsDateString() issuedAt!: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() skillsJson?: string[];
}
