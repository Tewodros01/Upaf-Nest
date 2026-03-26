import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AchievementCategory =
  | 'Learning'
  | 'Building'
  | 'Challenge'
  | 'Mentorship'
  | 'Career'
  | 'Social';

interface AchievementDef {
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  points: number;
}

const ACHIEVEMENTS: Record<string, AchievementDef> = {
  FIRST_COURSE:       { title: 'First Steps',        description: 'Enrolled in your first course',          icon: '📚', category: 'Learning',    points: 50  },
  COURSE_COMPLETED:   { title: 'Graduate',            description: 'Completed a course',                     icon: '🎓', category: 'Learning',    points: 200 },
  FIRST_PROJECT:      { title: 'Builder',             description: 'Published your first project',           icon: '🛠️', category: 'Building',    points: 100 },
  FIRST_JOB_APPLY:    { title: 'Job Seeker',          description: 'Applied for your first job',             icon: '💼', category: 'Career',      points: 50  },
  FIRST_COMPETITION:  { title: 'Competitor',          description: 'Entered your first competition',         icon: '🏁', category: 'Challenge',   points: 100 },
  COMPETITION_WIN:    { title: 'Champion',            description: 'Won a competition',                      icon: '🏆', category: 'Challenge',   points: 500 },
  FIRST_MENTOR:       { title: 'Mentee',              description: 'Booked your first mentor session',       icon: '🎯', category: 'Mentorship',  points: 100 },
  MENTOR_COMPLETE:    { title: 'Mentor',              description: 'Completed a mentoring session',          icon: '⭐', category: 'Mentorship',  points: 200 },
  FIRST_INVITE:       { title: 'Connector',           description: 'Invited your first friend',              icon: '🤝', category: 'Social',      points: 100 },
  SKILLS_5:           { title: 'Skilled',             description: 'Added 5 skills to your profile',         icon: '💡', category: 'Learning',    points: 100 },
};

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyAchievements(userId: string) {
    return this.prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.achievement.findMany({
      where: { userId, isPublic: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async award(userId: string, key: keyof typeof ACHIEVEMENTS) {
    const def = ACHIEVEMENTS[key];
    if (!def) return null;

    const existing = await this.prisma.achievement.findFirst({
      where: { userId, title: def.title },
    });
    if (existing) return existing;

    const achievement = await this.prisma.achievement.create({
      data: { userId, ...def, earnedAt: new Date() },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `🏅 Achievement Unlocked: ${def.title}`,
        body: def.description,
      },
    });

    return achievement;
  }

  async getLeaderboard(limit = 20) {
    const results = await this.prisma.achievement.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const userIds = results.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return results.map((r, i) => ({
      rank: i + 1,
      user: userMap.get(r.userId),
      totalPoints: r._sum.points ?? 0,
    }));
  }
}
