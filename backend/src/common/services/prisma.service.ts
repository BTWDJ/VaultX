import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    await this.seedCategories();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedCategories() {
    const defaultCategories = ['Social', 'Gaming', 'Finance', 'Shopping', 'Work', 'Other'];
    for (const name of defaultCategories) {
      await this.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log('Default categories verified/seeded successfully.');
  }
}
