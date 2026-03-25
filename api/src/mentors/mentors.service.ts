import {
  BadRequestException, ConflictException, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { MentorshipStatus, SessionStatus, TransactionType } from 'generated/prisma/client';
import { LedgerService } from '../ledger/ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookSessionDto, CreateMentorProfileDto, MentorQueryDto,
  ReviewMentorDto, UpdateMentorProfileDto,
} from './dto/mentor.dto';

@Injectable()
export class MentorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
  ) {}

  async findAll(query: MentorQueryDto) {
    const { search, maxRate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (maxRate !== undefined) where.hourlyRate = { lte: maxRate };
    if (search) {
      where.OR = [
        { expertise: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [mentors, total] = await Promise.all([
      this.prisma.mentorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, firstName: true, lastName: true, avatar: true,
              title: true, username: true,
            },
          },
          _count: { select: { sessions: true, reviews: true } },
        },
        orderBy: [{ rating: 'desc' }, { totalSessions: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.mentorProfile.count({ where }),
    ]);

    return { mentors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findOne(mentorId: string) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { userId: mentorId },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true, avatar: true,
            title: true, username: true, bio: true, github: true, linkedin: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { sessions: true, reviews: true } },
      },
    });
    if (!mentor) throw new NotFoundException('Mentor profile not found');
    return mentor;
  }

  async createProfile(userId: string, dto: CreateMentorProfileDto) {
    const existing = await this.prisma.mentorProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Mentor profile already exists');

    return this.prisma.mentorProfile.create({
      data: { userId, ...dto },
    });
  }

  async updateProfile(userId: string, dto: UpdateMentorProfileDto) {
    const profile = await this.prisma.mentorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Mentor profile not found');

    return this.prisma.mentorProfile.update({ where: { userId }, data: dto });
  }

  async bookSession(menteeId: string, dto: BookSessionDto) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { userId: dto.mentorId },
    });
    if (!mentor || !mentor.isActive) throw new NotFoundException('Mentor not available');
    if (dto.mentorId === menteeId) throw new BadRequestException('Cannot book yourself');

    const duration = dto.duration ?? 60;
    const cost = Math.floor((mentor.hourlyRate * duration) / 60);

    return this.prisma.$transaction(async (tx) => {
      if (cost > 0) {
        await this.ledger.applyEntry(tx, {
          userId: menteeId,
          title: `Mentor session: ${dto.title}`,
          amount: cost,
          balanceDelta: -cost,
          type: TransactionType.MENTOR_PAYMENT,
        });
        await this.ledger.applyEntry(tx, {
          userId: dto.mentorId,
          title: `Mentoring session: ${dto.title}`,
          amount: cost,
          balanceDelta: cost,
          type: TransactionType.INCOME,
        });
      }

      const session = await tx.mentorSession.create({
        data: {
          mentorId: dto.mentorId,
          menteeId,
          title: dto.title,
          description: dto.description,
          scheduledAt: new Date(dto.scheduledAt),
          duration,
          cost,
          status: MentorshipStatus.ACTIVE,
          sessionStatus: SessionStatus.SCHEDULED,
        },
      });

      await tx.notification.create({
        data: {
          userId: dto.mentorId,
          type: 'MENTOR_SESSION',
          title: 'New Session Booked!',
          body: `A new mentoring session "${dto.title}" has been booked for ${new Date(dto.scheduledAt).toLocaleDateString()}.`,
        },
      });

      await tx.notification.create({
        data: {
          userId: menteeId,
          type: 'MENTOR_SESSION',
          title: 'Session Confirmed!',
          body: `Your session "${dto.title}" is confirmed for ${new Date(dto.scheduledAt).toLocaleDateString()}.`,
        },
      });

      return session;
    });
  }

  async getMySessions(userId: string, role: 'mentor' | 'mentee') {
    const where = role === 'mentor' ? { mentorId: userId } : { menteeId: userId };
    return this.prisma.mentorSession.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async completeSession(sessionId: string, userId: string) {
    const session = await this.prisma.mentorSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.mentorId !== userId) throw new ForbiddenException('Only the mentor can complete a session');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.mentorSession.update({
        where: { id: sessionId },
        data: { sessionStatus: SessionStatus.COMPLETED, status: MentorshipStatus.COMPLETED },
      });

      await tx.mentorProfile.update({
        where: { userId },
        data: { totalSessions: { increment: 1 } },
      });

      return updated;
    });
  }

  async reviewMentor(mentorProfileId: string, reviewerId: string, dto: ReviewMentorDto) {
    const profile = await this.prisma.mentorProfile.findUnique({ where: { id: mentorProfileId } });
    if (!profile) throw new NotFoundException('Mentor profile not found');

    const review = await this.prisma.mentorReview.create({
      data: { mentorProfileId, reviewerId, rating: dto.rating, comment: dto.comment },
    });

    // Recalculate average rating
    const reviews = await this.prisma.mentorReview.findMany({
      where: { mentorProfileId },
      select: { rating: true },
    });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await this.prisma.mentorProfile.update({
      where: { id: mentorProfileId },
      data: { rating: Math.round(avg * 10) / 10 },
    });

    return review;
  }
}
