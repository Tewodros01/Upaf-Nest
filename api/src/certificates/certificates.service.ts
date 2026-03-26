import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async issue(dto: CreateCertificateDto) {
    return this.prisma.certificate.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        issuer: dto.issuer,
        description: dto.description,
        imageUrl: dto.imageUrl,
        verifyUrl: dto.verifyUrl,
        skillsJson: dto.skillsJson ?? [],
        issuedAt: new Date(dto.issuedAt),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  /** Auto-issue on course completion */
  async issueForCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        skills: { include: { skill: { select: { name: true } } } },
        instructor: { select: { firstName: true, lastName: true } },
      },
    });
    if (!course) return null;

    const existing = await this.prisma.certificate.findFirst({
      where: { userId, title: `${course.title} — Certificate of Completion` },
    });
    if (existing) return existing;

    return this.prisma.certificate.create({
      data: {
        userId,
        title: `${course.title} — Certificate of Completion`,
        issuer: `${course.instructor.firstName} ${course.instructor.lastName}`,
        description: `Successfully completed the course "${course.title}"`,
        skillsJson: course.skills.map((s) => s.skill.name),
        issuedAt: new Date(),
      },
    });
  }

  /** Auto-issue on competition win */
  async issueForCompetition(
    userId: string,
    competitionId: string,
    position: number,
  ) {
    const comp = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });
    if (!comp) return null;

    const suffix = position === 1 ? '1st' : position === 2 ? '2nd' : '3rd';

    const existing = await this.prisma.certificate.findFirst({
      where: { userId, title: `${comp.title} — ${suffix} Place` },
    });
    if (existing) return existing;

    return this.prisma.certificate.create({
      data: {
        userId,
        title: `${comp.title} — ${suffix} Place`,
        issuer: 'UPAfrican Platform',
        description: `Awarded ${suffix} place in the "${comp.title}" competition`,
        skillsJson: [],
        issuedAt: new Date(),
      },
    });
  }
}
