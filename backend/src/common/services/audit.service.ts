import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(userId: string, action: string, metadata?: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });
    } catch (err) {
      console.error(`Failed to write audit log for user ${userId}, action ${action}:`, err);
    }
  }
}
