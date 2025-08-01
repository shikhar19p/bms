// bms-monorepo/apps/http-backend/src/database/seed/seedRolePermissions.ts

import { prismaClient } from "..";

export async function seedRolePermissions() {
  // Fetch all roles and permissions.
  const roles = await prismaClient.role.findMany();
  const permissions = await prismaClient.permission.findMany();

  // Define a mapping function for each role to determine if a given permission should be allowed.
  // Using a Set for efficient lookup of allowed permissions for each role.
  const rolePermissionsMapping: Record<string, Set<string>> = {
    "BMSP_SUPER_ADMIN": new Set(permissions.map(p => p.key)), // All permissions for Super Admin

    "BMSP_ADMIN": new Set([
      // General Administration
      "admin:manage_platform_sub_admins",
      "admin:activate_deactivate_platform_admins",
      "platform:full_oversight", // Broad oversight, but not direct financial ops or super admin creation

      // Venue Management (Global)
      "venue:create_any",
      "venue:read_any",
      "venue:update_any",
      "venue:delete_any",
      "venue:verify_any",
      "venue:manage_venue_owners",
      "venue:manage_venue_staff_global",

      // Booking Management (Global)
      "booking:create_any",
      "booking:read_any",
      "booking:update_any",
      "booking:cancel_any",

      // User Management (Global)
      "user:create_any",
      "user:read_any_profile",
      "user:update_any_profile",
      "user:delete_any",
      "user:manage_roles_any",
      "user:restrict_any",

      // Customer Care related (if BMSP_ADMIN needs to oversee)
      "customer_care:resolve_user_inquiry",
      "customer_care:view_user_booking_history",

      // Reports (General, not just financial)
      "financial:view_all_reports", // Can view financial reports, but not manage finances
    ]),

    "BMSP_FINANCE_ADMIN": new Set([
      "financial:manage_disbursements",
      "financial:process_payments",
      "financial:reconcile_accounts",
      "financial:view_all_reports",
      "financial:view_all_transactions",
      "booking:read_any", // Read-only access to booking details (for financial reconciliation)
      "venue:read_any",   // Read-only access to venue details (for financial context)
    ]),

    "BMSP_VENUES_ADMIN": new Set([
      "venue:create_any",
      "venue:read_any",
      "venue:update_any",
      "venue:delete_any",
      "venue:verify_any",
      "venue:manage_venue_owners",
      "venue:manage_venue_staff_global", // Can manage staff across all venues
      "user:read_any_profile", // To look up venue owners/staff profiles
    ]),

    "BMSP_REGIONAL_VENUES_ADMIN": new Set([
      "venue:read_by_region",
      "venue:update_by_region",
      "venue:verify_by_region",
      // Potentially read-only access to user profiles within their regions for verification context
      "user:read_any_profile", // Can read any profile, but contextually limited by middleware
    ]),

    "BMSP_BOOKINGS_ADMIN": new Set([
      "booking:create_any",
      "booking:read_any",
      "booking:update_any",
      "booking:cancel_any",
      "venue:read_any", // Read-only access to venue details relevant for bookings
      "user:read_any_profile", // To look up user profiles related to bookings
    ]),

    "BMSP_CUSTOMER_CARE": new Set([
      "customer_care:resolve_user_inquiry",
      "customer_care:view_user_booking_history",
      "booking:read_any", // To view all bookings to assist users
      "user:read_any_profile", // To view user profiles to assist
      "venue:read_any", // To view venue details to assist
    ]),

    "VENUE_OWNER": new Set([
      "venue:create_own",
      "venue:read_own",
      "venue:update_own",
      "venue:manage_staff_own_venue",
      "booking:read_for_own_venue",
      "booking:update_for_own_venue",
      "booking:cancel_for_own_venue",
      "venue:restrict_users_on_own_venue",
      "financial:view_own_venue_reports",
      "user:read_own_profile", // Can read own profile
      "user:update_own_profile", // Can update own profile
    ]),

    // Assuming these are specific staff roles under a VENUE_OWNER
    "ADDITIONAL_VENUE_MANAGER": new Set([
      "venue:read_own", // Can read the venue they manage
      "venue:update_own", // Can update the venue they manage
      "booking:read_for_own_venue",
      "booking:update_for_own_venue",
      "booking:cancel_for_own_venue",
      "financial:view_own_venue_reports",
    ]),

    "VENUE_OPERATIONS_MANAGER": new Set([
      "venue:read_own", // Can read the venue they manage
      "venue:update_own", // Can update the venue they manage
      "venue:manage_own_operations",
      "booking:read_for_own_venue", // Often need to see bookings for operations
    ]),

    "VENUE_BOOKING_MANAGER": new Set([
      "venue:read_own", // Can read the venue they manage
      "booking:read_for_own_venue",
      "booking:update_for_own_venue",
      "booking:cancel_for_own_venue",
      "booking:create_own", // Can create bookings for their venue
    ]),

    "USER": new Set([
      "user:read_own_profile",
      "user:update_own_profile",
      "booking:create_own",
      "booking:read_own",
      "booking:update_own",
      "booking:cancel_own",
    ]),

    "SYSTEM": new Set(permissions.map(p => p.key)), // System processes have all permissions
    "ANONYMOUS": new Set(), // Anonymous users have no explicit permissions
  };

  // Assign permissions to roles
  for (const role of roles) {
    const allowedPermissions = rolePermissionsMapping[role.name];

    if (!allowedPermissions) {
      console.warn(`No permission mapping found for role: ${role.name}. Skipping.`);
      continue;
    }

    for (const perm of permissions) {
      const allowed = allowedPermissions.has(perm.key);
      await prismaClient.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: { allowed },
        create: {
          roleId: role.id,
          permissionId: perm.id,
          allowed,
        },
      });
    }
  }
  console.log("Role permissions seeded successfully.");
}
