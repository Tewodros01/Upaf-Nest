import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@GetUser('sub') userId: string) {
    return this.service.getMyCertificates(userId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.service.getUserCertificates(userId);
  }
}
