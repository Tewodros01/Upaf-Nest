import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CompetitionStatus,
  Prisma,
  Role,
  TransactionType,
} from 'generated/prisma/client';
import { AchievementsService } from '../achievements/achievements.service';
import { CertificatesService } from '../certificates/certificates.service';
import { MissionsService } from '../missions/missions.service';
import { LedgerService } from '../ledger/ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompetitionQueryDto,
  CreateCompetitionDto,
  ScoreEntryDto,
  SubmitEntryDto,
  UpdateCompetitionDto,
} from './dto/competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly achievements: AchievementsService,
    private readonly certificates: CertificatesService,
    private readonly missions: MissionsService,
  ) {}

  async findAll(query: CompetitionQueryDto) {
    const { type, status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CompetitionWhereInput = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [competitions, total] = await Promise.all([
      this.prisma.competition.findMany({
        where,
        include: {
          _count: { select: { entries: true } },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.competition.count({ where }),
    ]);

    return {
      competitions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId?: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
          take: 20,
          select: {
            id: true,
            userId: true,
            submissionUrl: true,
            description: true,
            score: true,
            rank: true,
            submittedAt: true,
          },
        },
        winners: { orderBy: { position: 'asc' } },
        _count: { select: { entries: true } },
      },
    });

    if (!competition) throw new NotFoundException('Competition not found');

    let myEntry: Awaited<
      ReturnType<typeof this.prisma.competitionEntry.findUnique>
    > | null = null;
    if (userId) {
      myEntry = await this.prisma.competitionEntry.findUnique({
        where: { competitionId_userId: { competitionId: id, userId } },
      });
    }

    return { ...competition, myEntry };
  }

  async create(dto: CreateCompetitionDto) {
    return this.prisma.competition.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async update(id: string, dto: UpdateCompetitionDto) {
    const comp = await this.prisma.competition.findUnique({ where: { id } });
    if (!comp) throw new NotFoundException('Competition not found');
    return this.prisma.competition.update({ where: { id }, data: dto });
  }

  async register(competitionId: string, userId: string) {
    const comp = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });
    if (!comp) throw new NotFoundException('Competition not found');

    if (
      comp.status === CompetitionStatus.COMPLETED ||
      comp.status === CompetitionStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Competition is no longer open for registration',
      );
    }

    const count = await this.prisma.competitionEntry.count({
      where: { competitionId },
    });
    if (count >= comp.maxParticipants)
      throw new BadRequestException('Competition is full');

    const existing = await this.prisma.competitionEntry.findUnique({
      where: { competitionId_userId: { competitionId, userId } },
    });
    if (existing) throw new ConflictException('Already registered');

    return this.prisma.$transaction(async (tx) => {
      if (comp.entryFee > 0) {
        await this.ledger.applyEntry(tx, {
          userId,
          title: `Competition entry: ${comp.title}`,
          amount: comp.entryFee,
          balanceDelta: -comp.entryFee,
          type: TransactionType.GAME_ENTRY,
        });
        await tx.competition.update({
          where: { id: competitionId },
          data: { prize: { increment: Math.floor(comp.entryFee * 0.8) } },
        });
      }

      const entry = await tx.competitionEntry.create({
        data: { competitionId, userId },
      });

      await tx.notification.create({
        data: {
          userId,
          type: 'CHALLENGE_RESULT',
          title: 'Competition Registered!',
          body: `You're registered for "${comp.title}". Good luck! 🏆`,
        },
      });

      return entry;
    });
  }

  async submitEntry(
    competitionId: string,
    userId: string,
    dto: SubmitEntryDto,
  ) {
    const entry = await this.prisma.competitionEntry.findUnique({
      where: { competitionId_userId: { competitionId, userId } },
    });
    if (!entry)
      throw new NotFoundException(
        'You are not registered for this competition',
      );

    return this.prisma.competitionEntry.update({
      where: { competitionId_userId: { competitionId, userId } },
      data: {
        submissionUrl: dto.submissionUrl,
        description: dto.description,
        submittedAt: new Date(),
      },
    });
  }

  async scoreEntry(
    competitionId: string,
    entryUserId: string,
    dto: ScoreEntryDto,
    judgeId: string,
  ) {
    const judge = await this.prisma.user.findUnique({ where: { id: judgeId } });
    if (!judge || (judge.role !== Role.ADMIN && judge.role !== Role.COMPANY)) {
      throw new ForbiddenException(
        'Only admins and company judges can score entries',
      );
    }

    const entry = await this.prisma.competitionEntry.findUnique({
      where: { competitionId_userId: { competitionId, userId: entryUserId } },
    });
    if (!entry) throw new NotFoundException('Entry not found');

    return this.prisma.competitionEntry.update({
      where: { competitionId_userId: { competitionId, userId: entryUserId } },
      data: { score: dto.score, rank: dto.rank },
    });
  }

  async announceWinners(competitionId: string, adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.ADMIN)
      throw new ForbiddenException('Admin only');

    const comp = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        entries: {
          where: { score: { not: null } },
          orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
          take: 3,
        },
      },
    });
    if (!comp) throw new NotFoundException('Competition not found');

    const prizeDistribution = [0.5, 0.3, 0.2];

    return this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < comp.entries.length; i++) {
        const entry = comp.entries[i];
        const position = i + 1;
        const prize = Math.floor(comp.prize * prizeDistribution[i]);

        await tx.competitionWinner.upsert({
          where: { competitionId_position: { competitionId, position } },
          create: { competitionId, userId: entry.userId, position, prize },
          update: { userId: entry.userId, prize },
        });

        if (prize > 0) {
          await this.ledger.applyEntry(tx, {
            userId: entry.userId,
            title: `Competition prize: ${comp.title} (${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} place)`,
            amount: prize,
            balanceDelta: prize,
            type: TransactionType.CHALLENGE_PRIZE,
          });

          await tx.notification.create({
            data: {
              userId: entry.userId,
              type: 'CHALLENGE_RESULT',
              title: `🏆 You placed ${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'}!`,
              body: `Congratulations! You won ${prize} coins in "${comp.title}"!`,
            },
          });
        }
      }

      await tx.competition.update({
        where: { id: competitionId },
        data: { status: CompetitionStatus.COMPLETED },
      });

      return { success: true, winners: comp.entries.length };
    });
  }

  async getLeaderboard(competitionId: string) {
    const entries = await this.prisma.competitionEntry.findMany({
      where: { competitionId, score: { not: null } },
      orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
      take: 50,
    });

    const userIds = entries.map((e) => e.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return entries.map((e, i) => ({
      rank: i + 1,
      user: userMap.get(e.userId),
      score: e.score,
      submittedAt: e.submittedAt,
      submissionUrl: e.submissionUrl,
    }));
  }

  async getMyEntries(userId: string) {
    return this.prisma.competitionEntry.findMany({
      where: { userId },
      include: { competition: true },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
