# Role Management in BookMySportz

This directory (`packages/db`) is responsible for defining and managing the core role-based access control (RBAC) system for the BookMySportz application. It includes the database schema for roles and permissions, as well as the seeding scripts to initialize these entities.

## How Roles Work

The BookMySportz application employs a hierarchical role structure to manage access and permissions across the platform. This ensures that users and automated processes have appropriate levels of access based on their responsibilities.

### 1. Role Definitions

Roles are defined in the `prisma/schema.prisma` file within this package. The `RoleType` enum lists all available roles in the system, such as:

*   **Platform-Level Roles:**
    *   `BMSP_SUPER_ADMIN`: Global administrator with full control.
    *   `BMSP_ADMIN`: General platform administration.
    *   `BMSP_FINANCE_ADMIN`: Manages financial operations.
    *   `BMSP_VENUES_ADMIN`: Manages all venues globally.
    *   `BMSP_REGIONAL_VENUES_ADMIN`: Manages venues within specific regions.
    *   `BMSP_BOOKINGS_ADMIN`: Manages all bookings globally.
    *   `BMSP_CUSTOMER_CARE`: Handles user inquiries and support.
*   **Venue-Level Roles:**
    *   `VENUE_OWNER`: Owner of a specific venue, with comprehensive control over their venue.
    *   `SECONDARY_VENUE_NAME_MANAGER`: Manages aspects of a specific venue (sub-role under `VENUE_OWNER`).
    *   `VENUE_OPERATIONS_MANAGER`: Manages operational aspects of a specific venue.
    *   `VENUE_BOOKING_MANAGER`: Manages bookings for a specific venue.
*   **General User Roles:**
    *   `USER`: Standard application user.
*   **System Roles:**
    *   `SYSTEM`: Represents automated processes and internal system actions.
    *   `ANONYMOUS`: Represents unauthenticated users or actions.

Each role has a defined set of permissions that dictate what actions a user or system process with that role can perform.

### 2. Permissions

Permissions are granular actions that can be performed within the application (e.g., `venue:create_any`, `booking:read_own`, `user:update_own_profile`). These permissions are also defined in `prisma/schema.prisma` and are associated with roles through the `RolePermission` model.

The specific permissions assigned to each role are configured in the seeding scripts, particularly in `src/seed/seed-permissions.ts` (which defines all possible permissions) and `src/seed/seedRolePermissions.ts` (which maps permissions to roles).

### 3. Seeding Process

The initial setup of roles and their associated permissions is handled by the database seeding scripts located in `src/seed/`. The main seeding logic is in `src/seed/index.ts`, which orchestrates the following:

1.  **`seedRoles()`**: Populates the `Role` table with the predefined roles.
2.  **`seedPermissions()`**: Populates the `Permission` table with all available permissions.
3.  **`seedRolePermissions()`**: Establishes the relationships between roles and permissions, granting specific permissions to each role.
4.  **`seedBmsSuperAdmin()`**: Creates the initial `BMSP_SUPER_ADMIN` account.
5.  **`seedGenericUser()`**: Creates `SYSTEM`, `ANONYMOUS`, and other generic `USER` accounts for testing and operational purposes.

This seeding process ensures that the application starts with a well-defined and functional RBAC system.

## Related Files

*   `prisma/schema.prisma`: Defines the `Account`, `Role`, `Permission`, and `RolePermission` models, including the `RoleType` enum.
*   `src/seed/index.ts`: Main entry point for database seeding.
*   `src/seed/seed-permissions.ts`: Defines all individual permissions.
*   `src/seed/seedRolePermissions.ts`: Assigns permissions to specific roles.
*   `src/roles.txt`: A human-readable document outlining the role hierarchy and their general responsibilities.
