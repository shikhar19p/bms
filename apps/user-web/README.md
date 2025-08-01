# `user-web` Application

This is the `user-web` application, a Next.js frontend designed for the end-users of the BookMySportz platform. It provides functionalities for browsing venues, booking slots, managing user profiles, and viewing booking history.

## 🚀 Getting Started

To run this application in development mode:

1.  Ensure you have completed the [monorepo's initial setup](../../README.md#getting-started).
2.  Navigate to the monorepo root and run:
    ```bash
    pnpm dev user-web
    ```
    Alternatively, you can run `turbo dev` from the monorepo root to start all applications concurrently.

## ✨ Features

*   Venue browsing and search.
*   Slot booking and management.
*   User profile viewing and editing.
*   Booking history and status tracking.
*   Authentication (login, registration).

## 📦 Dependencies

This application utilizes the following internal packages:

*   `@workspace/ui`: For shared UI components and design system elements.
*   `@workspace/eslint-config`: For consistent ESLint rules.
*   `@workspace/typescript-config`: For consistent TypeScript configurations.

Significant external dependencies include:

*   `next`: React framework for production-grade applications.
*   `react`, `react-dom`: Core React libraries.
*   `next-themes`: For theme management.
*   `lucide-react`: Icon library.
*   `axios`: Promise-based HTTP client for making API requests.
*   `sonner`: For toast notifications.

## 🛠️ Scripts

*   `pnpm dev`: Starts the development server.
*   `pnpm build`: Builds the application for production.
*   `pnpm start`: Starts the production server.
*   `pnpm lint`: Runs ESLint checks.
*   `pnpm lint:fix`: Runs ESLint checks and attempts to fix issues.
*   `pnpm typecheck`: Runs TypeScript type checks.

## 🎨 Design Principles & Patterns

This application follows a component-driven development approach, leveraging shared UI components from `@workspace/ui`. It emphasizes a clean, intuitive user experience. Data fetching is primarily handled via `axios` to interact with the `http-backend` API.

## 🧪 Testing

(Add details on how to run tests for `user-web` if applicable, e.g., `pnpm test` and what framework is used.)
