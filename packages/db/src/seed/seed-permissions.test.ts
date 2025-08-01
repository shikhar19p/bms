
// packages/db/src/seed/seed-permissions.test.ts
import { prismaClient } from '..';
import { seedPermissions } from './seed-permissions';
import { permissions } from './seed-permissions';

describe('seedPermissions', () => {
  it('should seed all predefined permissions into the database', async () => {
    // 1. Run the seeder
    await seedPermissions();

    // 2. Verify the results
    const seededPermissions = await prismaClient.permission.findMany();
    const permissionActions = seededPermissions.map((p) => p.action);

    // Check that the number of permissions seeded is correct
    expect(seededPermissions.length).toBe(permissions.length);

    // Check that all expected permission actions are present
    for (const permission of permissions) {
      expect(permissionActions).toContain(permission.action);
    }
  });

  it('should be idempotent', async () => {
    // Run the seeder once
    await seedPermissions();
    const countAfterFirstRun = await prismaClient.permission.count();

    // Run the seeder again
    await seedPermissions();
    const countAfterSecondRun = await prismaClient.permission.count();

    expect(countAfterSecondRun).toBe(countAfterFirstRun);
  });
});
