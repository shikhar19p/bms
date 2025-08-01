# `backend-common` Package

This package (`@workspace/backend-common`) provides common utilities, middleware, and services shared across the backend applications (`http-backend`, `ws-backend`) in the BookMySportz monorepo. Its purpose is to promote code reusability, consistency, and maintainability across backend services.

## 📦 Contents

This package includes, but is not limited to:

*   **`config/`**: Centralized configuration management.
*   **`data-access/redis/`**: Redis client and utility functions for caching and session management.
*   **`error/`**: Custom error classes and centralized error handling utilities.
*   **`logger/`**: Standardized logging setup using Winston.
*   **`middleware/`**: Common Express.js middleware (e.g., authentication, authorization, request logging).
*   **`sms/`**: Utilities for sending SMS notifications (e.g., via Twilio).
*   **`utils/`**: General utility functions.
*   **`ws/`**: WebSocket related utilities (if any shared logic for WebSocket connections).

## 🚀 Usage

To use components from this package in another backend application (e.g., `http-backend`):

1.  Add `@workspace/backend-common` to the `dependencies` in the consuming application's `package.json`:
    ```json
    "dependencies": {
      "@workspace/backend-common": "workspace:*",
      // ... other dependencies
    }
    ```
2.  Import and use the desired modules:
    ```typescript
    import { logger } from '@workspace/backend-common/logger';
    import { CustomError } from '@workspace/backend-common/error/base';
    // ...
    ```

## 🛠️ Scripts

*   `pnpm build`: Compiles TypeScript to JavaScript.
*   `pnpm dev`: Runs TypeScript compiler in watch mode for development.
*   `pnpm typecheck`: Runs TypeScript type checks.

## 📐 Design Principles & Patterns

This package is built with the following principles:

*   **Modularity:** Each utility or service is designed to be independent and reusable.
*   **Abstraction:** Provides abstract interfaces where appropriate to allow for different implementations (e.g., different SMS providers).
*   **Centralization:** Consolidates common logic to avoid duplication across backend services.
*   **Robustness:** Includes comprehensive error handling and logging mechanisms.

## 🧪 Testing

(Add details on how to run tests for `backend-common` if applicable, e.g., `pnpm test` and what framework is used.)
