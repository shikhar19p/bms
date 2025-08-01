# Code Style and Quality Guidelines

This document outlines the code style, linting, and formatting guidelines for the BookMySportz monorepo. Adhering to these standards ensures code consistency, readability, maintainability, and reduces the cognitive load for developers working across different parts of the codebase. Consistent code style is crucial for a smooth developer onboarding experience and long-term project health.

## 1. Principles

*   **Consistency:** All code should look and feel like it was written by a single person.
*   **Readability:** Code should be easy to understand and follow.
*   **Maintainability:** Consistent style reduces errors and simplifies future modifications.
*   **Automation:** Leverage tools to enforce style automatically, minimizing manual effort and human error.

## 2. Tools for Enforcement

We use the following tools to enforce our code style and quality standards:

### a. ESLint

*   **Purpose:** Static analysis tool to identify problematic patterns found in JavaScript/TypeScript code. It helps catch errors, enforce coding conventions, and improve code quality.
*   **Configuration:** Centralized in the `@workspace/eslint-config` package, which provides base rules for TypeScript, Next.js, and React.
*   **Usage:**
    *   **Check:** `pnpm lint` (runs `turbo lint` which executes ESLint across all relevant workspaces).
    *   **Fix:** `pnpm lint:fix` (attempts to automatically fix linting issues).
*   **Integration:** ESLint is integrated into our CI pipeline to prevent non-compliant code from being merged.
*   **IDE Integration:** Highly recommended to integrate ESLint into your IDE (e.g., VS Code ESLint extension) for real-time feedback.

### b. Prettier

*   **Purpose:** An opinionated code formatter that enforces a consistent style by parsing your code and re-printing it with its own rules. It handles indentation, line wrapping, spacing, and more.
*   **Configuration:** Defined in the root `prettier.json` file.
*   **Usage:**
    *   **Format:** `pnpm format` (formats all `*.{ts,tsx,md}` files).
    *   **Check (CI):** `pnpm format --check` (used in CI to ensure code is formatted).
*   **Integration:** Prettier is integrated into our CI pipeline.
*   **IDE Integration:** Highly recommended to integrate Prettier into your IDE (e.g., VS Code Prettier extension) to format on save.

### c. TypeScript

*   **Purpose:** Provides static type checking, which helps catch a wide range of errors during development, improves code clarity, and enables better tooling.
*   **Configuration:** Centralized in the `@workspace/typescript-config` package.
*   **Usage:**
    *   **Type Check:** `pnpm typecheck` (runs `tsc --noEmit` across all relevant workspaces).
*   **Integration:** TypeScript type checking is a mandatory step in our CI pipeline.

## 3. General Code Style Guidelines

While ESLint and Prettier handle most stylistic concerns automatically, here are some general guidelines:

### a. Naming Conventions

*   **Variables & Functions:** `camelCase` (e.g., `userName`, `getUserData`).
*   **Classes & Interfaces:** `PascalCase` (e.g., `UserService`, `IUser`)
*   **Constants:** `SCREAMING_SNAKE_CASE` for global constants (e.g., `API_BASE_URL`).
*   **Enums:** `PascalCase` for enum names, `SCREAMING_SNAKE_CASE` for enum members (e.g., `AccountStatus.ACTIVE`).
*   **Files:** `kebab-case` for most files (e.g., `user-service.ts`, `login-page.tsx`). `PascalCase` for React components (e.g., `Button.tsx`).

### b. Imports

*   **Ordering:** Group imports by type (e.g., built-in, external, internal, relative). ESLint rules will enforce this.
*   **Absolute Paths:** Prefer absolute imports for internal modules (e.g., `@workspace/common/utils`) to avoid complex relative paths.

### c. Comments

*   **Purpose:** Explain *why* a piece of code exists or *why* a particular design choice was made, rather than simply *what* the code does.
*   **JSDoc/TSDoc:** Use JSDoc/TSDoc for documenting public API (functions, classes, interfaces) to provide clear usage instructions and type information.
*   **Avoid Redundancy:** Do not comment on obvious code.

### d. Functions and Methods

*   **Small and Focused:** Functions should ideally do one thing and do it well (SRP).
*   **Early Exit:** Use guard clauses to handle edge cases and reduce nesting.
*   **Meaningful Names:** Function names should clearly describe their purpose.

### e. Error Handling

*   Follow the [Error Handling Strategy](../design/error-handling-strategy.md) document for consistent error management.

### f. Type Safety

*   Leverage TypeScript's type system fully. Use explicit types where beneficial, and avoid `any` unless absolutely necessary.
*   Ensure all new code is type-checked without errors.

## 4. Ensuring Compliance

*   **IDE Setup:** Configure your IDE (VS Code recommended) to automatically format on save and show ESLint warnings/errors.
*   **Pre-commit Hooks (Optional but Recommended):** Consider using tools like `lint-staged` and `husky` to run linters and formatters on staged files before committing, preventing non-compliant code from entering the repository.
*   **CI Pipeline:** The CI pipeline will act as the final gate, failing builds that do not adhere to the defined code quality standards.

By consistently applying these guidelines and utilizing the provided tools, we ensure a high standard of code quality across the BookMySportz monorepo.
