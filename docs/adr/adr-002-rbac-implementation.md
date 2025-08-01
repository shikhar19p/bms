# ADR-002: Implementing Role-Based Access Control (RBAC)

## Status

Accepted

## Context

The BookMySportz platform requires a robust and flexible access control system to manage different types of users (e.g., standard users, venue owners, various administrators) and their permissions to perform specific actions within the application.

## Decision

We have decided to implement a **Role-Based Access Control (RBAC)** system. This system will define distinct roles, assign specific permissions to each role, and associate users with one or more roles. The implementation will leverage Prisma for database schema definition and management.

## Rationale

1.  **Granular Control:** RBAC allows for fine-grained control over what actions users can perform, ensuring that users only have access to the functionalities necessary for their role.
2.  **Scalability:** As the application grows and new features or user types are introduced, new roles and permissions can be easily added and managed without significant code changes.
3.  **Maintainability:** Centralizing permission management simplifies updates and audits. Changes to a role's permissions automatically apply to all users assigned that role.
4.  **Security:** Reduces the risk of unauthorized access by enforcing the principle of least privilege.
5.  **Clarity:** Provides a clear and understandable model for defining user capabilities.

## Implementation Details

*   **Database Schema (`packages/db/prisma/schema.prisma`):**
    *   `Role` model: Defines the different roles (e.g., `BMSP_SUPER_ADMIN`, `VENUE_OWNER`, `USER`).
    *   `Permission` model: Defines individual actions that can be permitted (e.g., `venue:create_any`, `booking:read_own`).
    *   `RolePermission` model (join table): Links roles to permissions, specifying which permissions each role possesses.
    *   `Account` model: Links users to roles via `roleId`.
*   **Seeding Scripts (`packages/db/src/seed/`):**
    *   `seedRoles.ts`: Populates the `Role` table.
    *   `seedPermissions.ts`: Populates the `Permission` table.
    *   `seedRolePermissions.ts`: Assigns the predefined permissions to each role.
    *   `seedGenericUser.ts`: Creates initial user accounts with assigned roles.
*   **Middleware:** Authorization middleware will be implemented in the `http-backend` (and potentially `ws-backend`) to check a user's permissions before allowing access to specific routes or actions.

## Alternatives Considered

*   **Access Control Lists (ACLs):**
    *   **Pros:** Very fine-grained control, can assign permissions directly to individual users.
    *   **Cons:** Can become complex and difficult to manage in systems with many users and resources, less scalable than RBAC for managing large groups of users.
*   **Attribute-Based Access Control (ABAC):**
    *   **Pros:** Extremely flexible, allows decisions based on various attributes (user, resource, environment).
    *   **Cons:** Significantly more complex to design, implement, and manage, often overkill for most applications.

## Consequences

*   **Initial Setup:** Requires careful design of roles and permissions upfront.
*   **Development Overhead:** Developers need to be mindful of permission checks when implementing new features.
*   **Testing:** Thorough testing of authorization logic is crucial to prevent security vulnerabilities.

This RBAC implementation provides a robust and manageable solution for access control, aligning with our security and scalability requirements.
