import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentStatus, Role } from 'generated/prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CoursesService } from './courses.service';
import {
  CourseQueryDto,
  CreateCourseDto,
  ReviewCourseDto,
} from './dto/create-course.dto';
import { UpdateEnrollmentDto } from './dto/enroll-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // PUBLIC ENDPOINTS
  @Get()
  async getCourses(@Query() query: CourseQueryDto) {
    return this.coursesService.getCourses(query);
  }

  @Get(':id')
  async getCourseById(
    @Param('id') id: string,
    @GetUser('sub') userId?: string,
  ) {
    return this.coursesService.getCourseById(id, userId);
  }

  // INSTRUCTOR ENDPOINTS
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async createCourse(
    @GetUser('sub') instructorId: string,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(instructorId, createCourseDto);
  }

  @Get('instructor/my-courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async getInstructorCourses(@GetUser('sub') instructorId: string) {
    return this.coursesService.getInstructorCourses(instructorId);
  }

  @Get('instructor/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async getInstructorStats(@GetUser('sub') instructorId: string) {
    return this.coursesService.getInstructorStats(instructorId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async updateCourse(
    @Param('id') id: string,
    @GetUser('sub') instructorId: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(id, instructorId, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async deleteCourse(
    @Param('id') id: string,
    @GetUser('sub') instructorId: string,
  ) {
    await this.coursesService.deleteCourse(id, instructorId);
    return { message: 'Course deleted successfully' };
  }

  // STUDENT ENDPOINTS
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enrollInCourse(
    @Param('id') courseId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.coursesService.enrollInCourse(userId, courseId);
  }

  @Get('my-enrollments')
  @UseGuards(JwtAuthGuard)
  async getUserEnrollments(
    @GetUser('sub') userId: string,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.coursesService.getUserEnrollments(userId, status);
  }

  @Put(':id/enrollment')
  @UseGuards(JwtAuthGuard)
  async updateEnrollment(
    @Param('id') courseId: string,
    @GetUser('sub') userId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.coursesService.updateEnrollment(
      userId,
      courseId,
      updateEnrollmentDto,
    );
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard)
  async reviewCourse(
    @Param('id') courseId: string,
    @GetUser('sub') userId: string,
    @Body() reviewCourseDto: ReviewCourseDto,
  ) {
    return this.coursesService.reviewCourse(userId, courseId, reviewCourseDto);
  }
}
