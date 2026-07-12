import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { AuditService } from '../common/services/audit.service';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateAuditDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  metadata?: any;
}

@Controller('audit')
@UseGuards(AuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  async logAction(
    @GetUser('id') userId: string,
    @Body() dto: CreateAuditDto,
  ) {
    await this.auditService.logAction(userId, dto.action, dto.metadata);
    return { success: true };
  }
}
