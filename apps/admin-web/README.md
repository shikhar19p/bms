# `admin-web` Application

This is the `admin-web` application, a Next.js frontend responsible for administrative tasks and managing various aspects of the BookMySportz platform.

## 🚀 Getting Started

To run this application in development mode:

1.  Ensure you have completed the [monorepo's initial setup](../../README.md#getting-started).
2.  Navigate to the monorepo root and run:
    ```bash
    pnpm dev admin-web
    ```
    Alternatively, you can run `turbo dev` from the monorepo root to start all applications concurrently.

## ✨ Features

*   User management interface.
*   Venue creation, editing, and verification workflows.
*   Booking oversight and management.
*   Financial reporting and analytics for administrators.

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
*   `chart.js`, `react-chartjs-2`, `recharts`: For data visualization and charting.
*   `framer-motion`: For animations.

## 🛠️ Scripts

*   `pnpm dev`: Starts the development server.
*   `pnpm build`: Builds the application for production.
*   `pnpm start`: Starts the production server.
*   `pnpm lint`: Runs ESLint checks.
*   `pnpm lint:fix`: Runs ESLint checks and attempts to fix issues.
*   `pnpm typecheck`: Runs TypeScript type checks.

## 🎨 Design Principles & Patterns

This application follows a component-driven development approach, leveraging shared UI components from `@workspace/ui`. State management is handled using React's built-in capabilities and context where appropriate. Data fetching is typically done via API calls to the `http-backend`.

## 🧪 Testing

(Add details on how to run tests for `admin-web` if applicable, e.g., `pnpm test` and what framework is used.)