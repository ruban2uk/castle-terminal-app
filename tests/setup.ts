import { beforeAll, afterAll } from 'vitest';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const testConnectionString = process.env.DATABASE_URL;

if (!testConnectionString) {
  throw new Error('DATABASE_URL environment variable is not set for tests');
}

const adapter = new PrismaNeon({ connectionString: testConnectionString });

// Create test Prisma client
const prisma = new PrismaClient({ adapter });

// Global test setup
beforeAll(async () => {
  // Ensure database is connected
  await prisma.$connect();
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Export for use in tests
export { prisma };
