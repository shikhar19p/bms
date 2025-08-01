
// packages/db/src/seed/seedRolePermissions.test.ts
import { prismaClient } from '..';
import { seedRolePermissions } from './seedRolePermissions';
import { rolePermissions } from './seedRolePermissions';

describe('seedRolePermissions', () => {
  it('should seed all predefined role permissions into the database', async () => {
    // 1. Run the seeder
    await seedRolePermissions();

    // 2. Verify the results
    const seededRolePermissions = await prismaClient.rolePermission.findMany();

    // Check that the number of role permissions seeded is correct
    expect(seededRolePermissions.length).toBe(rolePermissions.length);
  });

  it('should be idempotent', async () => {
    // Run the seeder once
    await seedRolePermissions();
    const countAfterFirstRun = await prismaClient.rolePermission.count();

    // Run the seeder again
    await seedRolePermissions();
    const countAfterSecondRun = await prismaClient.rolePermission.count();

    expect(countAfterSecondRun).toBe(countAfterFirstRun);
  });
});
