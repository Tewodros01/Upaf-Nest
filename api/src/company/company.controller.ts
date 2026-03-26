import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompanyQueryDto, CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  findAll(@Query() query: CompanyQueryDto) {
    return this.service.findAll(query);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@GetUser('sub') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY, Role.ADMIN)
  create(@GetUser('sub') userId: string, @Body() dto: CreateCompanyDto) {
    return this.service.create(userId, dto);
  }

  @Put('my-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY, Role.ADMIN)
  update(@GetUser('sub') userId: string, @Body() dto: UpdateCompanyDto) {
    return this.service.update(userId, dto);
  }

  @Put(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  verify(@Param('id') id: string) {
    return this.service.verify(id);
  }
}
