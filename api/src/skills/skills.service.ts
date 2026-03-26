import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Skill, SkillLevel, UserSkill } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddUserSkillDto,
  CreateSkillDto,
  UpdateSkillDto,
  UpdateUserSkillDto,
} from './dto/skills.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  // SKILL MANAGEMENT
  async createSkill(data: CreateSkillDto): Promise<Skill> {
    try {
      return await this.prisma.skill.create({
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Skill with this name already exists');
      }
      throw error;
    }
  }

  async getAllSkills(category?: string): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSkillById(id: string): Promise<Skill> {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async updateSkill(id: string, data: UpdateSkillDto): Promise<Skill> {
    await this.getSkillById(id); // Check if exists

    return this.prisma.skill.update({
      where: { id },
      data,
    });
  }

  async deleteSkill(id: string): Promise<void> {
    await this.getSkillById(id); // Check if exists

    await this.prisma.skill.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSkillCategories(): Promise<string[]> {
    const categories = await this.prisma.skill.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => c.category);
  }

  // USER SKILLS MANAGEMENT
  async addUserSkill(
    userId: string,
    data: AddUserSkillDto,
  ): Promise<UserSkill> {
    // Check if skill exists
    await this.getSkillById(data.skillId);

    try {
      return await this.prisma.userSkill.create({
        data: {
          userId,
          skillId: data.skillId,
          level: data.level,
        },
        include: {
          skill: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User already has this skill');
      }
      throw error;
    }
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return this.prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserSkill(
    userId: string,
    skillId: string,
    data: UpdateUserSkillDto,
  ): Promise<UserSkill> {
    const userSkill = await this.prisma.userSkill.findUnique({
      where: {
        userId_skillId: { userId, skillId },
      },
    });

    if (!userSkill) {
      throw new NotFoundException('User skill not found');
    }

    return this.prisma.userSkill.update({
      where: {
        userId_skillId: { userId, skillId },
      },
      data,
      include: {
        skill: true,
      },
    });
  }

  async removeUserSkill(userId: string, skillId: string): Promise<void> {
    const userSkill = await this.prisma.userSkill.findUnique({
      where: {
        userId_skillId: { userId, skillId },
      },
    });

    if (!userSkill) {
      throw new NotFoundException('User skill not found');
    }

    await this.prisma.userSkill.delete({
      where: {
        userId_skillId: { userId, skillId },
      },
    });
  }

  // ANALYTICS & INSIGHTS
  async getSkillStats(skillId: string) {
    const skill = await this.getSkillById(skillId);

    const stats = await this.prisma.userSkill.groupBy({
      by: ['level'],
      where: { skillId },
      _count: { level: true },
    });

    const totalUsers = await this.prisma.userSkill.count({
      where: { skillId },
    });

    return {
      skill,
      totalUsers,
      levelDistribution: stats.reduce(
        (acc, stat) => {
          acc[stat.level] = stat._count.level;
          return acc;
        },
        {} as Record<SkillLevel, number>,
      ),
    };
  }

  async getPopularSkills(limit = 10) {
    return this.prisma.skill.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { userSkills: true },
        },
      },
      orderBy: {
        userSkills: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  // SEED DEFAULT SKILLS
  async seedDefaultSkills() {
    const defaultSkills = [
      // Programming
      { name: 'JavaScript', category: 'Programming', icon: '🟨' },
      { name: 'Python', category: 'Programming', icon: '🐍' },
      { name: 'Java', category: 'Programming', icon: '☕' },
      { name: 'TypeScript', category: 'Programming', icon: '🔷' },
      { name: 'React', category: 'Frontend', icon: '⚛️' },
      { name: 'Node.js', category: 'Backend', icon: '🟢' },
      { name: 'Vue.js', category: 'Frontend', icon: '💚' },
      { name: 'Angular', category: 'Frontend', icon: '🔴' },

      // Data Science
      { name: 'Machine Learning', category: 'Data Science', icon: '🤖' },
      { name: 'Data Analysis', category: 'Data Science', icon: '📊' },
      { name: 'SQL', category: 'Database', icon: '🗄️' },
      { name: 'MongoDB', category: 'Database', icon: '🍃' },

      // Design
      { name: 'UI/UX Design', category: 'Design', icon: '🎨' },
      { name: 'Figma', category: 'Design', icon: '🔧' },
      { name: 'Adobe Photoshop', category: 'Design', icon: '🖼️' },

      // DevOps
      { name: 'Docker', category: 'DevOps', icon: '🐳' },
      { name: 'AWS', category: 'Cloud', icon: '☁️' },
      { name: 'Git', category: 'Version Control', icon: '📝' },
    ];

    for (const skill of defaultSkills) {
      await this.prisma.skill.upsert({
        where: { name: skill.name },
        update: {},
        create: skill,
      });
    }

    return { message: 'Default skills seeded successfully' };
  }
}
