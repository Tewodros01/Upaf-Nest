import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, JobStatus, Role } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApplyJobDto,
  CreateJobDto,
  JobQueryDto,
  UpdateApplicationDto,
  UpdateJobDto,
} from './dto/job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: JobQueryDto) {
    const {
      type,
      workMode,
      experience,
      search,
      skillId,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: JobStatus.PUBLISHED };
    if (type) where.type = type;
    if (workMode) where.workMode = workMode;
    if (experience) where.experience = experience;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (skillId) where.skills = { some: { skillId } };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              logo: true,
              location: true,
              isVerified: true,
            },
          },
          skills: {
            include: {
              skill: { select: { id: true, name: true, icon: true } },
            },
          },
          _count: { select: { applications: true } },
        },
        orderBy: [{ isSponsored: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async create(creatorId: string, dto: CreateJobDto) {
    const { skillIds, deadline, ...jobData } = dto;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        creatorId,
        deadline: deadline ? new Date(deadline) : undefined,
        status: JobStatus.PUBLISHED,
        ...(skillIds?.length && {
          skills: {
            create: skillIds.map((skillId) => ({ skillId, required: true })),
          },
        }),
      },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    return job;
  }

  async update(id: string, creatorId: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');

    const user = await this.prisma.user.findUnique({
      where: { id: creatorId },
    });
    if (job.creatorId !== creatorId && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.job.update({ where: { id }, data: dto });
  }

  async apply(jobId: string, userId: string, dto: ApplyJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException(
        'Job not found or no longer accepting applications',
      );
    }

    const existing = await this.prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
    if (existing) throw new ConflictException('Already applied to this job');

    const application = await this.prisma.jobApplication.create({
      data: { jobId, userId, ...dto },
      include: { job: { select: { title: true } } },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'JOB_APPLICATION',
        title: 'Application Submitted!',
        body: `Your application for "${job.title}" has been submitted successfully.`,
      },
    });

    return application;
  }

  async getMyApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: { select: { name: true, logo: true } },
            skills: {
              include: { skill: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    dto: UpdateApplicationDto,
    reviewerId: string,
  ) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: { select: { title: true, creatorId: true } } },
    });
    if (!application) throw new NotFoundException('Application not found');

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
    });
    if (
      application.job.creatorId !== reviewerId &&
      reviewer?.role !== Role.ADMIN
    ) {
      throw new ForbiddenException('Not authorized');
    }

    const updated = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: dto.status as ApplicationStatus, notes: dto.notes },
    });

    const statusMessages: Record<string, string> = {
      SHORTLISTED: `🎉 You've been shortlisted for "${application.job.title}"!`,
      INTERVIEW_SCHEDULED: `📅 Interview scheduled for "${application.job.title}". Check your email.`,
      SELECTED: `🏆 Congratulations! You've been selected for "${application.job.title}"!`,
      REJECTED: `Your application for "${application.job.title}" was not successful this time.`,
    };

    if (statusMessages[dto.status]) {
      await this.prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'JOB_APPLICATION',
          title: 'Application Update',
          body: statusMessages[dto.status],
        },
      });
    }

    return updated;
  }

  async getJobApplications(jobId: string, requesterId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });
    if (job.creatorId !== requesterId && requester?.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            title: true,
            experience: true,
            github: true,
            linkedin: true,
            portfolio: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }
}
