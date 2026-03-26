import { Module } from '@nestjs/common';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { LedgerModule } from '../ledger/ledger.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [LedgerModule, AchievementsModule, MissionsModule],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}
