import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyQueryDto, CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CompanyQueryDto) {
    const { search, industry, isVerified, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyProfileWhereInput = {};
    if (industry) where.industry = industry;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.prisma.companyProfile.findMany({
        where,
        include: { _count: { select: { jobs: true } } },
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.companyProfile.count({ where }),
    ]);

    return { companies, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { id },
      include: {
        jobs: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { jobs: true } },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async getMyProfile(userId: string) {
    return this.prisma.companyProfile.findUnique({
      where: { userId },
      include: { _count: { select: { jobs: true } } },
    });
  }

  async create(userId: string, dto: CreateCompanyDto) {
    const existing = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Company profile already exists');
    return this.prisma.companyProfile.create({ data: { userId, ...dto } });
  }

  async update(userId: string, dto: UpdateCompanyDto) {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Company profile not found');
    return this.prisma.companyProfile.update({ where: { userId }, data: dto });
  }

  async verify(id: string) {
    const company = await this.prisma.companyProfile.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return this.prisma.companyProfile.update({ where: { id }, data: { isVerified: true } });
  }
}
