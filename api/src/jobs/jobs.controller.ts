import {
  Body, Controller, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApplyJobDto, CreateJobDto, JobQueryDto,
  UpdateApplicationDto, UpdateJobDto,
} from './dto/job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  findAll(@Query() query: JobQueryDto) {
    return this.service.findAll(query);
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  getMyApplications(@GetUser('sub') userId: string) {
    return this.service.getMyApplications(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMPANY, Role.INSTRUCTOR)
  getApplications(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.getJobApplications(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMPANY, Role.INSTRUCTOR)
  create(@GetUser('sub') creatorId: string, @Body() dto: CreateJobDto) {
    return this.service.create(creatorId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  apply(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.service.apply(id, userId, dto);
  }

  @Put('applications/:applicationId/status')
  @UseGuards(JwtAuthGuard)
  updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.service.updateApplicationStatus(applicationId, dto, userId);
  }
}
