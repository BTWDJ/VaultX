import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { CategoryController } from './category.controller';

@Module({
  controllers: [VaultController, CategoryController],
  providers: [VaultService],
})
export class VaultModule {}
