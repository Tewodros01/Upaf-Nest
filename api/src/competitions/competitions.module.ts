import { Module } from '@nestjs/common';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsService } from './competitions.service';
import { LedgerModule } from '../ledger/ledger.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [LedgerModule, AchievementsModule, CertificatesModule, MissionsModule],
  controllers: [CompetitionsController],
  providers: [CompetitionsService],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
