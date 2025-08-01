# 🤝 Contributing to BookMySportz

Welcome to the BookMySportz monorepo! We're excited to have you contribute. This guide will help you get started and ensure a smooth contribution process.

## 📝 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development Guidelines](#-development-guidelines)
- [Making Changes](#-making-changes)
- [Submitting Changes](#-submitting-changes)
- [Code Style](#-code-style)

## 🚀 Quick Start

1. **Fork the repo** → https://github.com/saavik-solutions/bms-monorepo
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bms-monorepo.git
   cd bms-monorepo
   pnpm install
   ```

## 🏗 Project Structure

The monorepo is organized into the following main directories:

- `apps/` - Contains all the applications
  - `admin-web/` - Admin dashboard application
  - `http-backend/` - HTTP API backend
  - `user-web/` - User-facing web application
  - `ws-backend/` - WebSocket backend
- `packages/` - Shared packages and libraries
  - `db/` - Database schemas and migrations
  - `ui/` - Shared UI components
  - `eslint-config/` - Shared ESLint configurations
  - `typescript-config/` - Shared TypeScript configurations

## 📝 Development Guidelines

1. **Package Manager:**

   - We use `pnpm` as our package manager
   - Install dependencies using `pnpm install`
   - Add new dependencies using `pnpm add`

2. **Environment Setup:**

   - Copy `.env.example` to `.env` in relevant directories
   - Set up necessary environment variables

3. **Database:**

   - We use Prisma as our ORM
   - Run migrations: `pnpm --filter @workspace/db prisma migrate dev`
   - Generate Prisma Client: `pnpm --filter @workspace/db generate`
   - Seed database: `pnpm --filter @workspace/db seed`

4. **Running Applications:**
   - Start all services: `pnpm dev`
   - Start specific app: `pnpm --filter @workspace/app-name dev`
   - Start with turbo: `pnpm turbo run dev --filter=@workspace/app-name`

## 🔄 Making Changes

1. **Create a new branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes following these practices:**

   - Write meaningful commit messages
   - Keep commits atomic and focused
   - Add tests for new features
   - Update documentation as needed

3. **Before committing:**
   1. Run tests: `pnpm test`
   2. Run linting: `pnpm lint`
   3. Format code: `pnpm format`
   4. Ensure types check: `pnpm type-check`
   5. Check workspace: `pnpm turbo run check`
   6. Build project: `pnpm build` (ensure no build errors)

## 📮 Submitting Changes

1. **Push your changes:**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request:**
   - Use a clear PR title and description
   - Reference any related issues
   - Fill out the PR template completely
   - Request reviews from relevant team members

## 💅 Code Style

1. **TypeScript:**

   - Use TypeScript for all new code
   - Ensure strict type checking
   - Follow the existing type patterns

2. **Formatting:**

   - Use Prettier for code formatting
   - Follow ESLint rules
   - Run `pnpm format` before committing

3. **Components:**

   - Follow the component structure in `packages/ui`
   - Use Shadcn UI components when available
   - Import components from `@workspace/ui/components/[name]`
   - Maintain consistent naming conventions
   - Add new components using: `pnpm dlx shadcn@latest add <component-name> -c packages/ui`

4. **Testing:**

   - Write unit tests for new features
   - Maintain test coverage
   - Test both success and error cases
   - Use appropriate testing libraries:
     - Frontend: Jest + React Testing Library
     - Backend: Jest + Supertest
     - E2E: Playwright

5. **Git Commit Standards:**
   - Use conventional commits format:
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation changes
     - `style:` for formatting changes
     - `refactor:` for code refactoring
     - `test:` for adding tests
     - `chore:` for maintenance tasks
   - Include scope if applicable: `feat(user-web): add login page`
   - Write clear commit messages in present tense
