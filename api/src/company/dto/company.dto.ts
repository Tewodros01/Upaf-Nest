import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() founded?: number;
}

export class UpdateCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() founded?: number;
}

export class CompanyQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsBoolean() isVerified?: boolean;
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
}
