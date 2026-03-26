import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, ProjectStatus } from 'generated/prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AddCommentDto,
  CreateProjectDto,
  ProjectQueryDto,
  UpdateProjectDto,
} from './dto/project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  findAll(@Query() query: ProjectQueryDto) {
    return this.service.findAll(query);
  }

  @Get('my-projects')
  @UseGuards(JwtAuthGuard)
  getMyProjects(@GetUser('sub') userId: string) {
    return this.service.getMyProjects(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@GetUser('sub') userId: string, @Body() dto: CreateProjectDto) {
    return this.service.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.publish(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.delete(id, userId);
  }

  @Post(':id/like')
  like(@Param('id') id: string) {
    return this.service.like(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.service.addComment(id, userId, dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setStatus(@Param('id') id: string, @Body('status') status: ProjectStatus) {
    return this.service.setStatus(id, status);
  }
}
