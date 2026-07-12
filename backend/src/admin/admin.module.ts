import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditController } from './audit.controller';

@Module({
  controllers: [AdminController, AuditController],
  providers: [AdminService],
})
export class AdminModule {}
