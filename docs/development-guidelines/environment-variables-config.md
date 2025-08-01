# Environment Variables and Configuration Management

This document outlines the strategy for managing environment variables and application configurations across the BookMySportz monorepo. Proper configuration management is essential for maintaining flexibility, security, and consistency across different development, staging, and production environments.

## 1. Principles

*   **Separation of Configuration from Code:** Configuration values should be externalized from the codebase.
*   **Environment-Specific Configuration:** Different environments (development, staging, production) require different configurations.
*   **Security:** Sensitive information (API keys, database credentials) must be stored securely and never committed to version control.
*   **Readability and Maintainability:** Configuration should be easy to understand, manage, and update.

## 2. Environment Variables (`.env` files)

We primarily use `.env` files for managing environment-specific variables. These files are loaded at runtime by libraries like `dotenv`.

### a. `.env` File Locations

*   **Root `.env`:** For variables common to the entire monorepo or used by Turborepo itself (e.g., `TURBO_TOKEN`).
*   **Workspace-Specific `.env`:** Each application (`apps/admin-web`, `apps/user-web`, `apps/http-backend`, `apps/ws-backend`) and potentially some packages (`packages/db` for database connection) will have its own `.env` file in its respective directory.

### b. `.env.example`

*   Each `.env` file should have a corresponding `.env.example` file committed to version control.
*   `.env.example` files contain all required environment variable keys with placeholder values or descriptive comments.
*   **Purpose:** To serve as a template for new developers or new environments, indicating which variables are needed without exposing sensitive data.

### c. Security and `.gitignore`

*   **`.env` files MUST NOT be committed to Git.** They are explicitly listed in the `.gitignore` file at the root of the monorepo.
*   Sensitive values (e.g., `DATABASE_URL`, `JWT_SECRET`, API keys) are stored directly in the `.env` files on each environment.

### d. Loading Environment Variables

*   **Backend Services (`http-backend`, `ws-backend`):** Use `dotenv` (or `dotenv-expand`) at the entry point of the application (e.g., `src/index.ts`) to load variables from `.env`.
*   **Frontend Applications (`admin-web`, `user-web`):** Next.js automatically loads environment variables from `.env.local`, `.env.development`, etc. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
*   **Packages:** Packages generally do not directly load `.env` files. Instead, they receive necessary configuration values from the consuming application or service.

## 3. Configuration Modules (`config/` directories)

For more structured and complex configurations, we use dedicated `config/` modules within applications or shared packages (e.g., `@workspace/backend-common/config`).

### a. Purpose

*   Provide a centralized place to define and access application settings.
*   Allow for validation of configuration values (e.g., using Zod).
*   Abstract the source of configuration (whether from environment variables, default values, or other sources).

### b. Structure

*   Typically, a `config/index.ts` file exports configuration objects.
*   Configuration values are read from `process.env` and provided with default fallbacks where appropriate.

### c. Example (Conceptual - Backend Common Config)

```typescript
// packages/backend-common/src/config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  // ... other environment variables
});

try {
  envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

export const appConfig = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: 30,
    refreshExpirationDays: 7,
  },
  // ... other structured configs
};

// apps/http-backend/src/index.ts
import '@workspace/backend-common/config'; // Ensure env vars are loaded and validated
import { appConfig } from '@workspace/backend-common/config';

const port = appConfig.port;
// ... use other config values
```

## 4. Environment-Specific Overrides

For more complex scenarios, you can use environment-specific `.env` files (e.g., `.env.development`, `.env.production`, `.env.test`) that are loaded based on the `NODE_ENV` variable. `dotenv` typically loads these in a specific order, allowing for overrides.

## 5. CI/CD Integration

*   **Secret Management:** In CI/CD pipelines, sensitive environment variables are injected securely by the CI/CD platform (e.g., GitHub Actions Secrets, GitLab CI/CD Variables, Jenkins Credentials) and are not stored directly in the repository.
*   **Validation:** The CI pipeline includes steps to validate that all required environment variables are present and correctly formatted before deployment.

By following this strategy, we ensure that our application configurations are secure, flexible, and easy to manage across all environments.
