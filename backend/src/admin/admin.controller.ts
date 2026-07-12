import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { AdminService } from './admin.service';
import { User as PrismaUser } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private verifyAdmin(user: PrismaUser) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('stats')
  getStats(@GetUser() user: any) {
    this.verifyAdmin(user);
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@GetUser() user: any) {
    this.verifyAdmin(user);
    return this.adminService.getUsers();
  }

  @Patch('users/:id/role')
  toggleRole(@GetUser() user: any, @Param('id') id: string) {
    this.verifyAdmin(user);
    return this.adminService.toggleRole(id);
  }
}
