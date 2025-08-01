# Authentication and Authorization Design

This document details the design and implementation of authentication and authorization within the BookMySportz platform. It covers how users are authenticated, how their identities are managed, and how access to resources is controlled based on their roles and permissions.

## 1. Authentication

Authentication is the process of verifying a user's identity. BookMySportz supports multiple authentication methods:

### a. Email/Password Authentication

*   **Process:** Users register with an email and password. Passwords are hashed using `bcryptjs` and stored securely in the `Account` model in the database.
*   **Login:** Upon successful login, a JSON Web Token (JWT) is issued.
*   **Password Management:** Includes features for password reset (using email verification tokens) and password history to prevent reuse.

### b. Google OAuth2 Authentication

*   **Process:** Users can sign in using their Google accounts. The backend integrates with Google's OAuth2 service (`google-auth-library`).
*   **User Linking:** If a Google-authenticated user's email matches an existing account, the accounts can be linked. Otherwise, a new account is created.
*   **Token Storage:** Google IDs are stored in the `Account` model. Access and refresh tokens can optionally be stored for accessing Google APIs on behalf of the user.

### c. Token Management (JWTs)

*   **Access Tokens:** Short-lived JWTs are issued upon successful authentication. These tokens are used to authenticate subsequent API requests.
*   **Refresh Tokens:** Long-lived refresh tokens are used to obtain new access tokens without requiring the user to re-authenticate frequently. These are typically stored securely (e.g., in HTTP-only cookies).
*   **Blacklisting:** Tokens can be blacklisted (e.g., upon logout or compromise) to invalidate them before their natural expiry.

## 2. Authorization (Role-Based Access Control - RBAC)

Authorization determines what an authenticated user is allowed to do. BookMySportz implements a robust Role-Based Access Control (RBAC) system.

### a. Core Concepts

*   **Roles:** Logical groupings of permissions (e.g., `BMSP_SUPER_ADMIN`, `VENUE_OWNER`, `USER`).
*   **Permissions:** Granular actions that can be performed (e.g., `venue:create_any`, `booking:read_own`).
*   **Users:** Assigned one or more roles.

### b. Implementation Details

*   **Database Schema:** The `packages/db/prisma/schema.prisma` defines the `Role`, `Permission`, and `RolePermission` models, which establish the relationships between roles and permissions.
*   **Role Hierarchy:** While not strictly enforced by the database schema, a conceptual hierarchy exists (e.g., `BMSP_SUPER_ADMIN` encompasses all permissions). This hierarchy is primarily managed through the assignment of permissions to roles in the seeding scripts.
*   **Seeding:** The `packages/db/src/seed/` scripts (`seedRoles.ts`, `seedPermissions.ts`, `seedRolePermissions.ts`) are responsible for populating the initial roles and their associated permissions in the database.
*   **Authorization Middleware:** In the `http-backend` (and potentially `ws-backend`), middleware functions are used to intercept requests and verify if the authenticated user (based on their assigned roles and permissions) has the necessary authorization to access the requested resource or perform the action.
    *   **Example (Pseudo-code):**
        ```typescript
        // Example authorization middleware
        function authorize(requiredPermission: string) {
          return (req: Request, res: Response, next: NextFunction) => {
            // Assume req.user contains authenticated user's roles and permissions
            const userPermissions = req.user.roles.flatMap(role => role.permissions.map(p => p.key));
            if (userPermissions.includes(requiredPermission)) {
              next(); // User has permission, proceed
            } else {
              res.status(403).json({ message: 'Access Denied: Insufficient permissions.' });
            }
          };
        }

        // Usage in a route
        router.post('/venues', authorize('venue:create_any'), venueController.createVenue);
        ```

### c. Key Principles

*   **Least Privilege:** Users and roles are granted only the minimum permissions required to perform their tasks.
*   **Separation of Concerns:** Authentication and authorization logic are distinct and handled by dedicated modules/middleware.
*   **Extensibility:** The RBAC system is designed to be easily extendable to accommodate new roles and permissions as the application evolves.

For a detailed breakdown of specific roles and their permissions, refer to the `packages/db/README.md` and the `packages/db/src/seed/seedRolePermissions.ts` file.
