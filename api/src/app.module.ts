import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AgentsModule } from './agents/agents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { MissionsModule } from './missions/missions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
// NEW MODULES FOR 6-PILLAR PLATFORM
import { SkillsModule } from './skills/skills.module';
import { CoursesModule } from './courses/courses.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { JobsModule } from './jobs/jobs.module';
import { MentorsModule } from './mentors/mentors.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000,  limit: 10  },  // 10 req/s
      { name: 'long',  ttl: 60000, limit: 100 },  // 100 req/min
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    TelegramModule,
    PaymentsModule,
    AgentsModule,
    MissionsModule,
    NotificationsModule,
    // NEW LEARN PILLAR MODULES
    SkillsModule,
    CoursesModule,
    CompetitionsModule,
    JobsModule,
    MentorsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
