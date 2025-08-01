# Database Schema and Relationships

This document provides a high-level overview of the core database schema and the relationships between key entities in the BookMySportz platform. The full, definitive schema is defined in `packages/db/prisma/schema.prisma`.

## 1. Core Entities

### a. `Account`

Represents a user account in the system. It stores authentication credentials, profile information, and links to roles.

*   **Key Fields:** `id`, `email`, `password` (hashed), `roleId`, `status`, `onboardingStatus`.
*   **Relationships:**
    *   One-to-Many with `Role` (an Account belongs to one Role).
    *   One-to-Many with `Token` (an Account can have multiple associated tokens).
    *   One-to-Many with `Invitation` (an Account can send multiple invitations).
    *   One-to-Many with `Venue` (an Account can own multiple Venues).
    *   One-to-Many with `AuditLog` (an Account can be the actor for multiple audit logs).

### b. `Role`

Defines the different types of roles within the RBAC system.

*   **Key Fields:** `id`, `name`, `type` (enum `RoleType`), `description`.
*   **Relationships:**
    *   One-to-Many with `Account` (a Role can be assigned to many Accounts).
    *   Many-to-Many with `Permission` through `RolePermission`.

### c. `Permission`

Represents a granular action that can be permitted or denied.

*   **Key Fields:** `id`, `key` (unique identifier like `venue:create_any`), `description`.
*   **Relationships:**
    *   Many-to-Many with `Role` through `RolePermission`.

### d. `Venue`

Represents a sports venue that can be booked.

*   **Key Fields:** `id`, `name`, `location`, `lat`, `lng`, `accountId` (owner).
*   **Relationships:**
    *   Many-to-One with `Account` (a Venue is owned by one Account).
    *   One-to-Many with `Slot` (a Venue can have many Slots).

### e. `Slot`

Represents a bookable time slot at a specific venue.

*   **Key Fields:** `id`, `venueId`, `startTime`, `endTime`, `price`, `isBooked`.
*   **Relationships:**
    *   Many-to-One with `Venue` (a Slot belongs to one Venue).
    *   One-to-One with `RecurrencePattern` (a Slot can have one recurrence pattern).

### f. `Token`

Used for various purposes like authentication (access/refresh tokens), email verification, password resets, and invitations.

*   **Key Fields:** `id`, `token`, `type` (enum `TokenType`), `accountId`, `expiresAt`.
*   **Relationships:**
    *   Many-to-One with `Account`.
    *   Many-to-One with `Role`.
    *   Many-to-One with `Invitation`.

### g. `Invitation`

Manages invitations for new users or administrators.

*   **Key Fields:** `id`, `email`, `role`, `status`, `invitedById`.
*   **Relationships:**
    *   Many-to-One with `Account` (who sent the invitation).
    *   One-to-Many with `Token`.

### h. `AuditLog`

Records significant events and actions within the system for auditing and security purposes.

*   **Key Fields:** `id`, `timestamp`, `level`, `action`, `actorId`, `resourceType`, `resourceId`.
*   **Relationships:**
    *   Many-to-One with `Account` (the actor who performed the action).

## 2. Conceptual Entity-Relationship Diagram (Simplified)

```mermaid
ERD
    Account ||--o{ Token : "has"
    Account ||--o{ Invitation : "sends"
    Account ||--o{ Venue : "owns"
    Account ||--o{ AuditLog : "performs"
    Account }o--|| Role : "has"

    Role ||--o{ RolePermission : "has"
    Permission ||--o{ RolePermission : "is granted"

    Venue ||--o{ Slot : "has"
    Slot ||--o| RecurrencePattern : "has"

    Invitation ||--o{ Token : "uses"
```

## 3. Key Enums

*   `AccountStatus`: Status of a user account (e.g., `ACTIVE`, `DEACTIVATED`, `SUSPENDED`).
*   `RoleType`: Defines the specific types of roles (e.g., `BMSP_SUPER_ADMIN`, `VENUE_OWNER`).
*   `TokenType`: Types of tokens used (e.g., `ACCESS`, `REFRESH`, `PASSWORD_RESET`).
*   `SlotType`: Types of booking slots (e.g., `CRICKET_MORNING`, `FOOTBALL_DAILY`).
*   `SlotStatus`: Status of a booking slot (e.g., `AVAILABLE`, `BOOKED`).
*   `LogLevel`: Severity levels for audit logs (e.g., `INFO`, `ERROR`, `FATAL`).
*   `ActorType`: Type of entity performing an action in audit logs (e.g., `USER`, `ADMIN`, `SYSTEM`).

This overview provides a foundational understanding of the database structure. For precise field definitions, constraints, and relationships, always refer to the `packages/db/prisma/schema.prisma` file.
