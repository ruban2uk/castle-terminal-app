import { beforeAll, afterAll } from 'vitest';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const testConnectionString = process.env.DATABASE_URL;

// Only connect to real DB if DATABASE_URL is provided (integration tests)
// Unit tests that mock prisma don't need this
let prisma: PrismaClient | null = null;

if (testConnectionString) {
  const adapter = new PrismaNeon({ connectionString: testConnectionString });
  prisma = new PrismaClient({ adapter });
}

// Global test setup
beforeAll(async () => {
  if (prisma) {
    await prisma.$connect();
  }
});

// Global test teardown
afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Export for use in tests
export { prisma };
