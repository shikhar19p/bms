// bms-monorepo/apps/http-backend/src/database/seed/seedPermissions.ts

import { prismaClient } from "..";

export async function seedPermissions() {
  const permissions = [
    // --- Platform-Level Admin Permissions (Global Scope) ---
    { key: "admin:manage_super_and_bms_admins", description: "Allows creation, update, and deletion of BMSP_SUPER_ADMIN and BMSP_ADMIN roles. (Exclusive to BMSP_SUPER_ADMIN)." },
    { key: "admin:manage_platform_sub_admins", description: "Allows creation, update, and deletion of platform-level sub-administrators (e.g., Finance, Venues, Bookings, Customer Care, Regional Admins)." },
    { key: "admin:activate_deactivate_platform_admins", description: "Allows activation and deactivation of platform-level administrators." },
    { key: "platform:full_oversight", description: "Provides full oversight of platform-wide operations, including user, finance, and verification controls." },

    // Financial Permissions (Platform-level)
    { key: "financial:manage_disbursements", description: "Allows handling of financial disbursements." },
    { key: "financial:process_payments", description: "Allows processing of payments." },
    { key: "financial:reconcile_accounts", description: "Allows financial reconciliations." },
    { key: "financial:view_all_reports", description: "Allows viewing of all platform-level financial reports." },
    { key: "financial:view_all_transactions", description: "Allows viewing of all platform-level transaction history." },

    // Venue Management Permissions (Platform-level)
    { key: "venue:create_any", description: "Allows creation of any venue on the platform." },
    { key: "venue:read_any", description: "Allows reading details of any venue on the platform." },
    { key: "venue:update_any", description: "Allows updating details of any venue on the platform." },
    { key: "venue:delete_any", description: "Allows deletion of any venue from the platform." },
    { key: "venue:verify_any", description: "Allows platform-level verification of any venue documentation." },
    { key: "venue:manage_venue_owners", description: "Allows managing (create/update/delete) VENUE_OWNER accounts." },
    { key: "venue:manage_venue_staff_global", description: "Allows managing staff (e.g., managers) for any venue globally." },
    { key: "venue:read_by_region", description: "Allows reading venue details within designated regions." },
    { key: "venue:update_by_region", description: "Allows updating venue details within designated regions." },
    { key: "venue:verify_by_region", description: "Allows verifying venue documentation within designated regions." },

    // Booking Management Permissions (Platform-level)
    { key: "booking:create_any", description: "Allows creation of any booking on the platform." },
    { key: "booking:read_any", description: "Allows reading details of any booking on the platform." },
    { key: "booking:update_any", description: "Allows updating details of any booking on the platform." },
    { key: "booking:cancel_any", description: "Allows cancellation of any booking on the platform." },

    // User Management Permissions (Platform-level)
    { key: "user:create_any", description: "Allows creation of any user account." },
    { key: "user:read_any_profile", description: "Allows reading any user's profile information." },
    { key: "user:update_any_profile", description: "Allows updating any user's profile information." },
    { key: "user:delete_any", description: "Allows deletion of any user account." },
    { key: "user:manage_roles_any", description: "Allows assigning or changing roles for any user." },
    { key: "user:restrict_any", description: "Allows restricting or blocking any user account globally." },

    // --- VENUE_OWNER Permissions (Limited to their Own Venues) ---
    { key: "venue:create_own", description: "Allows a VENUE_OWNER to create their own venue(s)." },
    { key: "venue:read_own", description: "Allows a VENUE_OWNER to read details of their own venue(s)." },
    { key: "venue:update_own", description: "Allows a VENUE_OWNER to update details of their own venue(s)." },
    { key: "venue:manage_staff_own_venue", description: "Allows a VENUE_OWNER to manage (create/update/delete) staff for their own venue." },
    { key: "booking:read_for_own_venue", description: "Allows a VENUE_OWNER to read bookings for their own venue(s)." },
    { key: "booking:update_for_own_venue", description: "Allows a VENUE_OWNER to update bookings for their own venue(s)." },
    { key: "booking:cancel_for_own_venue", description: "Allows a VENUE_OWNER to cancel bookings for their own venue(s)." },
    { key: "venue:restrict_users_on_own_venue", description: "Allows a VENUE_OWNER to restrict or block users who misuse their venues." },
    { key: "financial:view_own_venue_reports", description: "Allows a VENUE_OWNER to view financial reports specific to their own venue(s)." },
    { key: "venue:manage_own_operations", description: "Allows a VENUE_OPERATIONS_MANAGER to manage operational aspects of their own venue." }, // For VENUE_OPERATIONS_MANAGER

    // --- User Permissions (Standard User) ---
    { key: "user:read_own_profile", description: "Allows a standard user to read their own profile." },
    { key: "user:update_own_profile", description: "Allows a standard user to update their own profile." },
    { key: "booking:create_own", description: "Allows a standard user to create their own bookings." },
    { key: "booking:read_own", description: "Allows a standard user to read their own bookings." },
    { key: "booking:update_own", description: "Allows a standard user to update their own bookings." },
    { key: "booking:cancel_own", description: "Allows a standard user to cancel their own bookings." },

    // --- Customer Care Permissions ---
    { key: "customer_care:resolve_user_inquiry", description: "Allows addressing user inquiries and resolving issues." },
    { key: "customer_care:view_user_booking_history", description: "Allows viewing a user's booking history for assistance." },
  ];

  for (const perm of permissions) {
    await prismaClient.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description }, // Update description if key exists
      create: {
        key: perm.key,
        description: perm.description,
      },
    });
  }
  console.log("Permissions seeded successfully.");
}
