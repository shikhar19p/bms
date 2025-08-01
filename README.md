# BookMySportz Monorepo

Welcome to the BookMySportz monorepo! This repository contains all the applications and shared packages that make up the BookMySportz platform. It's designed to facilitate efficient development, code sharing, and consistent practices across different services.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v20 or higher)
*   pnpm (v8 or higher) - Install globally: `npm install -g pnpm`
*   Docker (for database and other services)

### Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd bms-monorepo
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Start Docker services (e.g., PostgreSQL, Redis):**
    ```bash
    docker-compose up -d
    ```
4.  **Seed the database:**
    ```bash
    pnpm --filter=db db:seed
    ```
    (Refer to `packages/db/README.md` for more details on roles and seeding.)

### Running the Applications

To start all applications in development mode:

```bash
turbo dev
```

This command will concurrently start the development servers for `admin-web`, `user-web`, `http-backend`, and `ws-backend`.

## 📦 Monorepo Structure

This monorepo is organized into two main directories:

*   `apps/`: Contains the individual applications.
*   `packages/`: Contains shared libraries and utilities used across the applications.

### Applications (`apps/`)

| Application      | Description                                                              | Technologies |
| :--------------- | :----------------------------------------------------------------------- | :----------- |
| `admin-web`      | Next.js frontend for administrative tasks and venue management.          | Next.js, React, TypeScript |
| `user-web`       | Next.js frontend for end-users to browse venues, book slots, etc.        | Next.js, React, TypeScript |
| `http-backend`   | Express.js backend for handling HTTP API requests (authentication, venue management, bookings). | Node.js, Express.js, TypeScript |
| `ws-backend`     | WebSocket backend for real-time communication (e.g., live updates).      | Node.js, WebSocket, TypeScript |
| `docs`           | (Placeholder for future documentation site, if needed)                   |              |

### Packages (`packages/`)

| Package              | Description                                                              | Technologies |
| :------------------- | :----------------------------------------------------------------------- | :----------- |
| `backend-common`     | Common utilities, middleware, and services shared by backend applications. | TypeScript |
| `common`             | Shared types, interfaces, enums, and schemas used across the monorepo.   | TypeScript |
| `db`                 | Database interaction layer, Prisma schema, migrations, and seeding scripts. | Prisma, TypeScript |
| `eslint-config`      | Centralized ESLint configurations for consistent code style.             | ESLint |
| `typescript-config`  | Centralized TypeScript configurations.                                   | TypeScript |
| `ui`                 | Reusable UI components and design system elements.                       | React, Tailwind CSS, Radix UI |

## ⚡ Turborepo Commands

Turborepo is used to manage and optimize tasks across the monorepo.

*   **`pnpm build`**: Builds all applications and packages.
*   **`pnpm dev`**: Starts all applications in development mode.
*   **`pnpm lint`**: Lints all codebases.
*   **`pnpm format`**: Formats code using Prettier.
*   **`pnpm test`**: Runs tests across all relevant workspaces (if configured).

## 🤝 Contributing

Please refer to our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## 📄 Documentation

Comprehensive documentation is available in the `docs/` directory, covering architectural decisions, design patterns, and more in-depth explanations of various system components.

---