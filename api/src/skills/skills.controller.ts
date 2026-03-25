import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto, AddUserSkillDto, UpdateUserSkillDto } from './dto/skills.dto';
import { Role } from 'generated/prisma/client';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  // SKILL MANAGEMENT (Admin only)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createSkill(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
  }

  @Get()
  async getAllSkills(@Query('category') category?: string) {
    return this.skillsService.getAllSkills(category);
  }

  @Get('categories')
  async getSkillCategories() {
    return this.skillsService.getSkillCategories();
  }

  @Get('popular')
  async getPopularSkills(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.skillsService.getPopularSkills(limitNum);
  }

  @Get(':id')
  async getSkillById(@Param('id') id: string) {
    return this.skillsService.getSkillById(id);
  }

  @Get(':id/stats')
  async getSkillStats(@Param('id') id: string) {
    return this.skillsService.getSkillStats(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteSkill(@Param('id') id: string) {
    await this.skillsService.deleteSkill(id);
    return { message: 'Skill deleted successfully' };
  }

  // USER SKILLS MANAGEMENT
  @Post('my-skills')
  async addUserSkill(
    @GetUser('sub') userId: string,
    @Body() addUserSkillDto: AddUserSkillDto,
  ) {
    return this.skillsService.addUserSkill(userId, addUserSkillDto);
  }

  @Get('my-skills')
  async getUserSkills(@GetUser('sub') userId: string) {
    return this.skillsService.getUserSkills(userId);
  }

  @Put('my-skills/:skillId')
  async updateUserSkill(
    @GetUser('sub') userId: string,
    @Param('skillId') skillId: string,
    @Body() updateUserSkillDto: UpdateUserSkillDto,
  ) {
    return this.skillsService.updateUserSkill(userId, skillId, updateUserSkillDto);
  }

  @Delete('my-skills/:skillId')
  async removeUserSkill(
    @GetUser('sub') userId: string,
    @Param('skillId') skillId: string,
  ) {
    await this.skillsService.removeUserSkill(userId, skillId);
    return { message: 'Skill removed successfully' };
  }

  // ADMIN UTILITIES
  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async seedDefaultSkills() {
    return this.skillsService.seedDefaultSkills();
  }
}