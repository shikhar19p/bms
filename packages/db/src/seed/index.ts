// packages/db/src/seed/index.ts

import { seedRoles } from './seedRoles';
import { seedPermissions } from './seed-permissions';
import { seedRolePermissions } from './seedRolePermissions';
import { seedBmsSuperAdmin } from './seed-bms-super-admin';
import { prismaClient } from '..';
import { RoleType } from '@prisma/client'; // Make sure RoleType is imported for use here
import bcrypt from "bcryptjs"; // Assuming you have bcryptjs installed for password hashing

// Helper function to seed a generic user for testing/simulation (updated)
async function seedGenericUser(email: string, name: string, roleType: RoleType, id?: string) {
  const role = await prismaClient.role.findFirst({
    where: { type: roleType },
  });

  if (!role) {
    console.error(`Error: Role ${roleType} not found for generic user seeding.`);
    process.exit(1);
  }

  // Check if user already exists by ID (if provided) or email
  const existingUser = await prismaClient.account.findFirst({
    where: id ? { id } : { email },
  });

  if (existingUser) {
    console.log(`${roleType} user with email ${email} (ID: ${existingUser.id}) already exists. Skipping creation.`);
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash("TestPassword123!", 10); // Dummy password for seeded users

  const newUser = await prismaClient.account.create({
    data: {
      id: id, // Pass ID if provided (for SYSTEM/ANONYMOUS)
      email,
      name,
      password: hashedPassword,
      phone: null,
      isEmailVerified: true,
      isPhoneVerified: true,
      status: 'ACTIVE',
      roleId: role.id, // Link to the correct Role
    },
  });
  console.log(`Seeded ${roleType} account: ${name} (${email}) - ID: ${newUser.id}`);
  return newUser;
}


async function main() {
  // Enable PostGIS extension if it doesn't exist
  try {
    await prismaClient.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;
    console.log("PostGIS extension enabled (or already exists).");
  } catch (err) {
    console.error("Error enabling PostGIS extension:", err);
    throw err;
  }

  // Run your core seed functions first
  await seedRoles(); // This must run first to ensure roles exist
  await seedPermissions();
  await seedRolePermissions();

  // Seed Super Admin
  await seedBmsSuperAdmin();

  // --- NEW: Seed a dedicated SYSTEM account ---
  // This account will serve as the 'actor' for SYSTEM-generated audit logs.
  const systemAccount = await seedGenericUser(
    'system@bookmysportz.com',
    'Automated System',
    RoleType.SYSTEM, // Link to the SYSTEM Role
    'SYSTEM' // Explicitly set the ID to 'SYSTEM'
  );

  // --- NEW: Seed a dedicated ANONYMOUS account ---
  // This account will serve as the 'actor' for unauthenticated audit logs.
  const anonymousAccount = await seedGenericUser(
    'anonymous@bookmysportz.com',
    'Anonymous User',
    RoleType.ANONYMOUS, // Link to the ANONYMOUS Role
    'ANONYMOUS' // Explicitly set the ID to 'ANONYMOUS'
  );


  // --- NEW: Seed a few generic USER accounts for simulation/testing ---
  const testUser1 = await seedGenericUser('testuser1@example.com', 'Test User One', RoleType.USER);
  const testUser2 = await seedGenericUser('testuser2@example.com', 'Test User Two', RoleType.USER);

  // Log the IDs so you can copy them to app.ts
  console.log("\n--- Seeded Account IDs for app.ts simulation ---");
  console.log(`SYSTEM Account ID: ${systemAccount?.id}`);
  console.log(`ANONYMOUS Account ID: ${anonymousAccount?.id}`);
  console.log(`Test User 1 ID: ${testUser1?.id}`);
  console.log(`Test User 2 ID: ${testUser2?.id}`);
  // Find your super admin's ID if needed for admin simulation

  console.log("--------------------------------------------------\n");
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
    process.exit(0);
  });