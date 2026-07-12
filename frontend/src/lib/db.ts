import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let dbInstance: PrismaClient;

if (globalForPrisma.prisma) {
  dbInstance = globalForPrisma.prisma;
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  dbInstance = new PrismaClient({ adapter });
}

export const db = dbInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
