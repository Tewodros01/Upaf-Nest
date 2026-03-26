import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectStatus } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddCommentDto,
  CreateProjectDto,
  ProjectQueryDto,
  UpdateProjectDto,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProjectQueryDto) {
    const { search, skillId, userId, isFeatured, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      status: {
        in: [
          ProjectStatus.SUBMITTED,
          ProjectStatus.APPROVED,
          ProjectStatus.FEATURED,
        ],
      },
    };
    if (userId) where.userId = userId;
    if (isFeatured) where.isFeatured = true;
    if (skillId) where.skills = { some: { skillId } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          skills: {
            include: {
              skill: { select: { id: true, name: true, icon: true } },
            },
          },
          _count: { select: { comments: true } },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { likes: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            title: true,
          },
        },
        skills: { include: { skill: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            // userId only — enrich below
          },
        },
        _count: { select: { comments: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    await this.prisma.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const { skillIds, ...data } = dto;
    return this.prisma.project.create({
      data: {
        ...data,
        userId,
        status: ProjectStatus.DRAFT,
        ...(skillIds?.length && {
          skills: { create: skillIds.map((skillId) => ({ skillId })) },
        }),
      },
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId)
      throw new ForbiddenException('Not your project');

    const { skillIds, ...data } = dto;

    if (skillIds) {
      await this.prisma.projectSkill.deleteMany({ where: { projectId: id } });
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(skillIds && {
          skills: { create: skillIds.map((skillId) => ({ skillId })) },
        }),
      },
      include: { skills: { include: { skill: true } } },
    });
  }

  async publish(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId)
      throw new ForbiddenException('Not your project');

    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.SUBMITTED },
    });
  }

  async delete(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId)
      throw new ForbiddenException('Not your project');
    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }

  async like(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.project.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
  }

  async addComment(id: string, userId: string, dto: AddCommentDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.projectComment.create({
      data: { projectId: id, userId, content: dto.content },
    });
  }

  async getMyProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Called by admin to feature/approve
  async setStatus(id: string, status: ProjectStatus) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.project.update({
      where: { id },
      data: { status, isFeatured: status === ProjectStatus.FEATURED },
    });
  }
}
