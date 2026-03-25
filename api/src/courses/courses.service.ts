import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Course,
  CourseReview,
  CourseStatus,
  Enrollment,
  EnrollmentStatus,
  Prisma,
  Role,
  TransactionType,
} from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CourseQueryDto,
  CreateCourseDto,
  ReviewCourseDto,
} from './dto/create-course.dto';
import { UpdateEnrollmentDto } from './dto/enroll-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // COURSE MANAGEMENT
  async createCourse(
    instructorId: string,
    data: CreateCourseDto,
  ): Promise<Course> {
    const { skillIds, ...courseData } = data;

    // Verify instructor role
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
    });

    if (
      !instructor ||
      ![Role.INSTRUCTOR as string, Role.ADMIN as string].includes(
        instructor.role,
      )
    ) {
      throw new ForbiddenException('Only instructors can create courses');
    }

    // Verify skills exist
    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds }, isActive: true },
    });

    if (skills.length !== skillIds.length) {
      throw new BadRequestException('One or more skills not found');
    }

    return this.prisma.course.create({
      data: {
        ...courseData,
        instructorId,
        skills: {
          create: skillIds.map((skillId) => ({ skillId })),
        },
      },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
    });
  }

  async getCourses(query: CourseQueryDto) {
    const {
      search,
      level,
      skillId,
      instructorId,
      isFree,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
      status: CourseStatus.PUBLISHED,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (level) where.level = level;
    if (instructorId) where.instructorId = instructorId;
    if (isFree !== undefined) where.price = isFree ? 0 : { gt: 0 };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (skillId) {
      where.skills = {
        some: { skillId },
      };
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          skills: {
            include: { skill: true },
          },
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCourseById(
    id: string,
    userId?: string,
  ): Promise<Course & { isEnrolled?: boolean }> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let isEnrolled = false;
    if (userId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId: id },
        },
      });
      isEnrolled = !!enrollment;
    }

    return { ...course, isEnrolled };
  }

  async updateCourse(
    id: string,
    instructorId: string,
    data: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    const { skillIds, ...updateData } = data;

    // Update skills if provided
    if (skillIds) {
      const skills = await this.prisma.skill.findMany({
        where: { id: { in: skillIds }, isActive: true },
      });

      if (skills.length !== skillIds.length) {
        throw new BadRequestException('One or more skills not found');
      }

      // Delete existing skills and create new ones
      await this.prisma.courseSkill.deleteMany({
        where: { courseId: id },
      });
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...updateData,
        ...(skillIds && {
          skills: {
            create: skillIds.map((skillId) => ({ skillId })),
          },
        }),
      },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
    });
  }

  async deleteCourse(id: string, instructorId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.prisma.course.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  // ENROLLMENT MANAGEMENT
  async enrollInCourse(userId: string, courseId: string): Promise<Enrollment> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      throw new NotFoundException('Course not found or not available');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Handle payment if course is not free
    if (course.price > 0) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.coinsBalance < course.price) {
        throw new BadRequestException('Insufficient coins balance');
      }

      // Deduct coins and create transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { coinsBalance: { decrement: course.price } },
        });

        await tx.user.update({
          where: { id: course.instructorId },
          data: { coinsBalance: { increment: Math.floor(course.price * 0.8) } }, // 80% to instructor
        });

        // Create transaction record
        const wallet = await tx.wallet.findFirst({
          where: { userId, isDefault: true },
        });

        if (wallet) {
          await tx.transaction.create({
            data: {
              title: `Course Purchase: ${course.title}`,
              amount: course.price,
              type: TransactionType.COURSE_PURCHASE,
              userId,
              walletId: wallet.id,
              date: new Date(),
            },
          });
        }
      });
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Update course enrollment count
    await this.prisma.course.update({
      where: { id: courseId },
      data: { enrollCount: { increment: 1 } },
    });

    return enrollment;
  }

  async getUserEnrollments(
    userId: string,
    status?: EnrollmentStatus,
  ): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            skills: {
              include: { skill: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateEnrollment(
    userId: string,
    courseId: string,
    data: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const updateData: Prisma.EnrollmentUpdateInput = { ...data };

    // Auto-complete if progress reaches 100%
    if (
      data.progress === 100 &&
      enrollment.status !== EnrollmentStatus.COMPLETED
    ) {
      updateData.status = EnrollmentStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: updateData,
      include: {
        course: true,
      },
    });
  }

  // REVIEWS & RATINGS
  async reviewCourse(
    userId: string,
    courseId: string,
    data: ReviewCourseDto,
  ): Promise<CourseReview> {
    // Check if user is enrolled and has completed the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'You must be enrolled to review this course',
      );
    }

    // Check if already reviewed
    const existingReview = await this.prisma.courseReview.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this course');
    }

    const review = await this.prisma.courseReview.create({
      data: {
        userId,
        courseId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    // Update course rating
    await this.updateCourseRating(courseId);

    return review;
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    const reviews = await this.prisma.courseReview.findMany({
      where: { courseId },
      select: { rating: true },
    });

    if (reviews.length > 0) {
      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

      await this.prisma.course.update({
        where: { id: courseId },
        data: { rating: Math.round(averageRating * 10) / 10 }, // Round to 1 decimal
      });
    }
  }

  // INSTRUCTOR DASHBOARD
  async getInstructorCourses(instructorId: string) {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstructorStats(instructorId: string) {
    const [totalCourses, totalEnrollments, totalRevenue, avgRating] =
      await Promise.all([
        this.prisma.course.count({
          where: { instructorId, isPublished: true },
        }),
        this.prisma.enrollment.count({
          where: { course: { instructorId } },
        }),
        this.prisma.course.aggregate({
          where: { instructorId },
          _sum: { price: true },
        }),
        this.prisma.course.aggregate({
          where: { instructorId, isPublished: true },
          _avg: { rating: true },
        }),
      ]);

    return {
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue._sum.price || 0,
      averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
    };
  }
}
