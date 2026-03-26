import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { AchievementsModule } from '../achievements/achievements.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [AchievementsModule, CertificatesModule, MissionsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
