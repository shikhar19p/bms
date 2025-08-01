// packages/db/src/seed/seedRoles.test.ts
import { prismaClient } from '..';
import { seedRoles } from './seedRoles';
import { RoleType } from '@prisma/client';

describe('seedRoles', () => {
  it('should seed all predefined roles into the database', async () => {
    // 1. Run the seeder
    await seedRoles();

    // 2. Verify the results
    const roles = await prismaClient.role.findMany();
    const roleTypes = roles.map((r) => r.type);

    // Check that the number of roles seeded is correct
    // The number of roles is based on the `roles` array in `seedRoles.ts`
    expect(roles.length).toBe(14); 

    // Check that all expected role types are present
    expect(roleTypes).toContain(RoleType.BMSP_SUPER_ADMIN);
    expect(roleTypes).toContain(RoleType.BMSP_ADMIN);
    expect(roleTypes).toContain(RoleType.BMSP_FINANCE_ADMIN);
    expect(roleTypes).toContain(RoleType.BMSP_VENUES_ADMIN);
    expect(roleTypes).toContain(RoleType.BMSP_REGIONAL_VENUES_ADMIN);
    expect(roleTypes).toContain(RoleType.BMSP_BOOKINGS_ADMIN);
    expect(roleTypes).toContain(RoleType.BMSP_CUSTOMER_CARE);
    expect(roleTypes).toContain(RoleType.VENUE_OWNER);
    expect(roleTypes).toContain(RoleType.SECONDARY_VENUE_NAME_MANAGER);
    expect(roleTypes).toContain(RoleType.VENUE_OPERATIONS_MANAGER);
    expect(roleTypes).toContain(RoleType.VENUE_BOOKING_MANAGER);
    expect(roleTypes).toContain(RoleType.USER);
    expect(roleTypes).toContain(RoleType.SYSTEM);
    expect(roleTypes).toContain(RoleType.ANONYMOUS);
  });

  it('should be idempotent', async () => {
    // Run the seeder once
    await seedRoles();
    const countAfterFirstRun = await prismaClient.role.count();

    // Run the seeder again
    await seedRoles();
    const countAfterSecondRun = await prismaClient.role.count();

    expect(countAfterSecondRun).toBe(countAfterFirstRun);
  });
});
