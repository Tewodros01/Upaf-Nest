import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompetitionsService } from './competitions.service';
import {
  CompetitionQueryDto,
  CreateCompetitionDto,
  ScoreEntryDto,
  SubmitEntryDto,
  UpdateCompetitionDto,
} from './dto/competition.dto';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  @Get()
  findAll(@Query() query: CompetitionQueryDto) {
    return this.service.findAll(query);
  }

  @Get('my-entries')
  @UseGuards(JwtAuthGuard)
  getMyEntries(@GetUser('sub') userId: string) {
    return this.service.getMyEntries(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('sub') userId?: string) {
    return this.service.findOne(id, userId);
  }

  @Get(':id/leaderboard')
  getLeaderboard(@Param('id') id: string) {
    return this.service.getLeaderboard(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMPANY)
  create(@Body() dto: CreateCompetitionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMPANY)
  update(@Param('id') id: string, @Body() dto: UpdateCompetitionDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.register(id, userId);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submit(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: SubmitEntryDto,
  ) {
    return this.service.submitEntry(id, userId, dto);
  }

  @Put(':id/entries/:entryUserId/score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMPANY)
  scoreEntry(
    @Param('id') id: string,
    @Param('entryUserId') entryUserId: string,
    @Body() dto: ScoreEntryDto,
    @GetUser('sub') judgeId: string,
  ) {
    return this.service.scoreEntry(id, entryUserId, dto, judgeId);
  }

  @Post(':id/announce-winners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  announceWinners(@Param('id') id: string, @GetUser('sub') adminId: string) {
    return this.service.announceWinners(id, adminId);
  }
}
