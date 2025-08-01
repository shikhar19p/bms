// packages/db/src/test/setup.ts
import { prismaClient } from '../';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

beforeAll(async () => {
  await delay(5000); // Wait for 5 seconds before all tests
});

beforeEach(async () => {
  // Clean up the database before each test
  const modelNames = Object.keys(prismaClient).filter(
    (key) =>
      !key.startsWith('_') &&
      !key.startsWith('$') &&
      typeof (prismaClient as any)[key].deleteMany === 'function'
  );

  for (const modelName of modelNames) {
    await (prismaClient as any)[modelName].deleteMany({});
  }
});

afterAll(async () => {
  // Disconnect from the database after all tests are done
  await prismaClient.$disconnect();
});
