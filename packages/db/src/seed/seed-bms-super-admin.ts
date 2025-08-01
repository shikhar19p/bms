//packages/db/src/seed/seed-bms-super-admin.ts

import { RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prismaClient } from "..";
import { seedDbConfig } from "./seed-db-config";



// Number of salt rounds for bcrypt (adjust based on security/performance trade-offs)
const SALT_ROUNDS = 10;

// Helper function to seed an admin account based on provided details
async function seedAdmin({
  roleType,
  email,
  password,
  name,
  phone,
}: {
  roleType: string;
  email: string;
  password: string;
  name: string;
  phone: string ;
}) {
  if (!email || !password) {
    console.error(
      `Error: ${roleType} email and password must be provided in environment variables.`
    );
    process.exit(1);
  }

  const role = await prismaClient.role.findFirst({
    where: { type: roleType as RoleType },
  });
  
  if (!role) {
    console.error(`Error: Role ${roleType} not found.`);
    process.exit(1);
  }
  

  // Check if an admin with this email already exists
  const existingAdmin = await prismaClient.account.findFirst({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`${roleType} already exists. Skipping creation.`);
    return;
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create the admin account
  const newAdmin = await prismaClient.account.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      roleId: role.id,
    },
  });

  console.log(`${roleType} created successfully:`, newAdmin);
}

// Seed Super Admin
export async function seedBmsSuperAdmin() {
  const SUPER_ADMIN_EMAIL = seedDbConfig.credentials.superAdmin.email;
  const SUPER_ADMIN_PASSWORD = seedDbConfig.credentials.superAdmin.password;
  const SUPER_ADMIN_PHONE = seedDbConfig.credentials.superAdmin.phone;
  const SUPER_ADMIN_NAME = "Super Admin";

  await seedAdmin({
    roleType: "BMSP_SUPER_ADMIN",
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    name: SUPER_ADMIN_NAME,
    phone: SUPER_ADMIN_PHONE ?? "",
  });
}

// Seed Finance Admin
// export async function seedFinanceAdmin() {
//   const FINANCE_ADMIN_EMAIL = config.credentials.financeAdmin.email;
//   const FINANCE_ADMIN_PASSWORD = config.credentials.financeAdmin.password;
//   const FINANCE_ADMIN_PHONE = config.credentials.financeAdmin.phone;
//   const FINANCE_ADMIN_NAME = "Finance Admin";

//   await seedAdmin({
//     roleType: "BMSP_FINANCE_ADMIN",
//     email: FINANCE_ADMIN_EMAIL,
//     password: FINANCE_ADMIN_PASSWORD,
//     name: FINANCE_ADMIN_NAME,
//     phone: FINANCE_ADMIN_PHONE ?? "",
//   });
// }
