import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './services/prisma.service';
import { EncryptionService } from './services/encryption.service';
import { AuditService } from './services/audit.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [PrismaService, EncryptionService, AuditService],
  exports: [PrismaService, EncryptionService, AuditService],
})
export class CommonModule {}
