# `common` Package

This package (`@workspace/common`) serves as a central repository for shared types, interfaces, enums, and schemas used across the entire BookMySportz monorepo. Its primary goal is to ensure type safety, consistency, and reduce duplication of common data structures between frontend and backend applications.

## 📦 Contents

This package includes, but is not limited to:

*   **`constants/`**: Global constants.
*   **`domain/`**: Core domain entities and their types.
*   **`enums/`**: Shared enumerations (e.g., `AccountStatus`, `RoleType`).
*   **`interfaces/`**: Common interfaces for data structures.
*   **`schema/`**: Zod schemas for data validation (e.g., user input validation).
*   **`types/`**: General utility types.

## 🚀 Usage

To use types, enums, or schemas from this package in any application or package within the monorepo:

1.  Add `@workspace/common` to the `dependencies` in the consuming package's `package.json`:
    ```json
    "dependencies": {
      "@workspace/common": "workspace:*",
      // ... other dependencies
    }
    ```
2.  Import the desired entities:
    ```typescript
    import { RoleType } from '@workspace/common/enums';
    import { UserSchema } from '@workspace/common/schema/user';
    import { IBooking } from '@workspace/common/interfaces';
    // ...
    ```

## 🛠️ Scripts

*   `pnpm build`: Compiles TypeScript to JavaScript.
*   `pnpm dev`: Runs TypeScript compiler in watch mode for development.
*   `pnpm typecheck`: Runs TypeScript type checks.

## 📐 Design Principles

*   **Single Source of Truth:** Defines common data structures in one place to prevent discrepancies.
*   **Type Safety:** Provides strong typing for improved developer experience and reduced runtime errors.
*   **Reusability:** Enables easy sharing of types and validation schemas across the monorepo.

## 🧪 Testing

(Add details on how to run tests for `common` if applicable, e.g., `pnpm test` and what framework is used.)
