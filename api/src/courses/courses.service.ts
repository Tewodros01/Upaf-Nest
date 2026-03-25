import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CourseQueryDto, CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, CourseStatus, Prisma, Role } from 'generated/prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async createCourse(instructorId: string, data: CreateCourseDto): Promise<Course>{
    const { skillIds, ...courseData} = data;

    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId}
    });

    if(!instructor || ![Role.INSTRUCTOR as string, Role.ADMIN as string].includes(instructor.role)){
      throw new ForbiddenException('Only instructores can create courses');
    }

    const skills = await this.prisma.skill.findMany({
      where:{ id: { in: skillIds }, isActive: true}
    });

    if(skills.length !== skillIds.length){
      throw new BadRequestException('One or more skill not found');
    }

    return this.prisma.course.create({
      data: {
        ...courseData,
        instructorId,
        skills:{
          create: skillIds.map((skillId)=> ({skillId}))
        }
      },
      include:{
        instructor:{
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        skills:{
          include:{
            skill: true,
          }
        },
        _count:{
          select: {
            enrollments: true,
            reviews: true,
          }
        }
      }
    });
  }

  async getCourses(query: CourseQueryDto){
    const {
      search,
      level,
      skillId,
      instructorId,
      isFree,
      isFeatured,
      sortBy = "createdAt",
      sortOrder = "desc",
      page= 1,
      limit = 10,
    }= query;

    const skip = (page -1) * limit;

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
      status: CourseStatus.PUBLISHED,
    }

    if(search){
      where.OR = [
        {title: { contains: search, mode: "insensitive"}},
        {description: { contains: search, mode: "insensitive"}}
      ]
    }

    if(level) where.level = level;
    if(instructorId) where.instructorId = instructorId;
    if(isFree !== undefined) where.price = isFree? 0 : {gt: 0};
    if(isFeatured !== undefined) where.isFeatured = isFeatured;

    if(skillId){
      where.skills = {
        some: { skillId }
      }
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy: { [sortBy]: sortOrder},
        skip,
        take: limit,
        include:{
          instructor:{
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          skills:{
            include:{
              skill: true,
            }
          },
          _count:{
            select: {
              enrollments: true,
              reviews: true,
            }
          }
        }
      }),
      this.prisma.course.count({where})
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total/ limit)
      }
    }
  }

  async getCurseById(id: string, userId: string): Promise<Course & { isEnrolled?: boolean}>{
    const course = await this.prisma.course.findUnique({
      where:{ id},
      include:{
        instructor:{
          select:{
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        reviews:{
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count:{
          select: {
            enrollments: true, reviews: true,
          }
        }
      }
    })

    if(!course) throw new NotFoundException('Course not found');

    let isEnrolled = false;
    if(userId){
      const enrllment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId: id}
        }
      });
      isEnrolled = !!enrllment;
    }

    return {
      ...course,
      isEnrolled
    }
  }

  async updateCourse(id: string, instructorId: string, data: UpdateCourseDto): Promise<Course>{
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if(!course){
      throw new NotFoundException('Course not found');
    }

    if(course.instructorId !== instructorId){
      throw new ForbiddenException('You can only update your own courses');
    }

    const {skillIds, ...updatedData} = data;

    if(skillIds){
      const skill = await this.prisma.skill.findMany({
        where: { id: { in: skillIds }, isActive: true}
      });

      if(skill.length !== skillIds.length){
        throw new BadRequestException("One or more skills not found");
      }

      await this.prisma.courseSkill.deleteMany({
        where: { courseId: id}
      });
    }

    return this.prisma.course.update({
      where:{ id},
      data: {
        ...updatedData,
        ...(skillIds && {
          skills: {
            create: skillIds.map((skillId)=>({skillId}))
          }
        })
      },
      include:{
        instructor:{
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        skills:{
          include:{
            skill: true,
          }
        },
        _count:{
          select: {
            enrollments: true,
            reviews: true,
          }
        }
      }
    });
  }

  async deleteCourse(id: string, instructurId: string): Promise<void>{
    const course = await this.prisma.course.findUnique({
      where: { id }
    });

    if(!course) throw new NotFoundException('Course not found');

    if(course.instructorId !== instructurId ){
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.prisma.course.update({
      where: { id },
      data: { status: "ARCHIVED"}
    })
  }
}
