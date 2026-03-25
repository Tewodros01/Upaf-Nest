import {
  Body, Controller, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  BookSessionDto, CreateMentorProfileDto, MentorQueryDto,
  ReviewMentorDto, UpdateMentorProfileDto,
} from './dto/mentor.dto';
import { MentorsService } from './mentors.service';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly service: MentorsService) {}

  @Get()
  findAll(@Query() query: MentorQueryDto) {
    return this.service.findAll(query);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@GetUser('sub') userId: string) {
    return this.service.findOne(userId);
  }

  @Get('my-sessions')
  @UseGuards(JwtAuthGuard)
  getMySessions(
    @GetUser('sub') userId: string,
    @Query('role') role: 'mentor' | 'mentee' = 'mentee',
  ) {
    return this.service.getMySessions(userId, role);
  }

  @Get(':mentorId')
  findOne(@Param('mentorId') mentorId: string) {
    return this.service.findOne(mentorId);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  createProfile(@GetUser('sub') userId: string, @Body() dto: CreateMentorProfileDto) {
    return this.service.createProfile(userId, dto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@GetUser('sub') userId: string, @Body() dto: UpdateMentorProfileDto) {
    return this.service.updateProfile(userId, dto);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  bookSession(@GetUser('sub') userId: string, @Body() dto: BookSessionDto) {
    return this.service.bookSession(userId, dto);
  }

  @Put('sessions/:sessionId/complete')
  @UseGuards(JwtAuthGuard)
  completeSession(@Param('sessionId') sessionId: string, @GetUser('sub') userId: string) {
    return this.service.completeSession(sessionId, userId);
  }

  @Post(':mentorProfileId/review')
  @UseGuards(JwtAuthGuard)
  reviewMentor(
    @Param('mentorProfileId') mentorProfileId: string,
    @GetUser('sub') userId: string,
    @Body() dto: ReviewMentorDto,
  ) {
    return this.service.reviewMentor(mentorProfileId, userId, dto);
  }
}
