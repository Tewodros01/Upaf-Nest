import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@GetUser('sub') userId: string) {
    return this.service.getMyAchievements(userId);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: number) {
    return this.service.getLeaderboard(limit ? Number(limit) : 20);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.service.getUserAchievements(userId);
  }
}
