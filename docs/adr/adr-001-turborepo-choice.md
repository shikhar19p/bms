# ADR-001: Choosing Turborepo for Monorepo Management

## Status

Accepted

## Context

The BookMySportz application is composed of multiple distinct services (frontend web apps, backend APIs, WebSocket server) and shared libraries. Managing these as separate repositories would lead to challenges in dependency management, consistent tooling, and cross-project development.

## Decision

We have decided to adopt a monorepo strategy and use **Turborepo** as the build system and task runner, in conjunction with **pnpm** for package management.

## Rationale

1.  **Optimized Build Performance:** Turborepo's intelligent caching and parallel execution significantly speed up build times, especially in a CI/CD environment and for local development. It only rebuilds what's necessary.
2.  **Simplified Dependency Management:** pnpm's workspace feature, combined with Turborepo, allows for efficient dependency hoisting and symlinking of local packages, reducing disk space usage and installation times.
3.  **Atomic Changes:** Changes across multiple packages can be committed and deployed together, ensuring consistency.
4.  **Consistent Tooling:** Centralized configuration for ESLint, TypeScript, and other tools (via shared packages like `@workspace/eslint-config` and `@workspace/typescript-config`) ensures a consistent development experience.
5.  **Improved Developer Experience:** Developers can work on multiple related projects within a single environment, making it easier to understand the overall system and make changes that span across services.
6.  **Scalability:** The monorepo structure, managed by Turborepo, provides a scalable foundation for adding new applications and packages in the future.

## Alternatives Considered

*   **Multiple Repositories (Polyrepo):**
    *   **Pros:** Clear separation of concerns, easier to manage access control for individual services.
    *   **Cons:** Complex dependency management, inconsistent tooling, slower cross-project development, increased overhead for CI/CD.
*   **Lerna:**
    *   **Pros:** Mature monorepo tool, widely adopted.
    *   **Cons:** Turborepo offers superior performance due to its advanced caching and parallelization capabilities, which was a primary driver for our decision.

## Consequences

*   **Initial Setup:** Requires understanding of monorepo concepts and Turborepo/pnpm configuration.
*   **Tooling Integration:** Careful integration of various development tools (IDE, linters, formatters) to work seamlessly within the monorepo context.
*   **Learning Curve:** New team members will need to learn Turborepo and pnpm concepts.

This decision aligns with our goal of building a highly efficient, scalable, and maintainable development environment for BookMySportz.
