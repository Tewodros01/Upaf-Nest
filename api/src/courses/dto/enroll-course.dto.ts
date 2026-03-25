import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { EnrollmentStatus } from "generated/prisma/enums";

export class EnrollCourseDto {
    @IsString()
    courseId!: string;
}

export class UpdateEnrollmentDto{
    @IsOptional()
    @IsEnum(EnrollmentStatus)
    status?: EnrollmentStatus;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    progress?: number;
}