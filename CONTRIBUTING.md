# Contributing to BookMySportz

We welcome contributions to the BookMySportz monorepo! By following these guidelines, you can help us maintain code quality, consistency, and a smooth development workflow.

## 🚀 Getting Started

Before you start, please ensure you have followed the [main README's setup instructions](../README.md#getting-started).

## 🌳 Branching Strategy

We use a feature-branch workflow:

1.  **`main`**: The main branch, always deployable.
2.  **`develop`**: Integration branch for new features.
3.  **Feature Branches**: Create new branches from `develop` for each new feature or bug fix. Name them descriptively (e.g., `feat/add-user-profile`, `fix/login-bug`).

## 💡 Development Workflow

1.  **Pull the latest `develop` branch:**
    ```bash
    git checkout develop
    git pull origin develop
    ```
2.  **Create a new feature branch:**
    ```bash
    git checkout -b feat/your-feature-name
    ```
3.  **Make your changes:** Write code, tests, and update documentation.
4.  **Run tests and linting:** Before committing, ensure all tests pass and linting rules are satisfied.
    ```bash
    pnpm test # Or turbo test
    pnpm lint # Or turbo lint
    ```
5.  **Format your code:**
    ```bash
    pnpm format
    ```
6.  **Commit your changes:** Follow the [Commit Message Guidelines](#commit-message-guidelines).
7.  **Push your branch:**
    ```bash
    git push origin feat/your-feature-name
    ```
8.  **Create a Pull Request (PR):** Open a PR from your feature branch to `develop`. Provide a clear description of your changes.

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps with automated changelog generation and understanding commit history.

**Format:**

```
<type>(<scope>): <subject>

[body]

[footer]
```

*   **`type`**: Must be one of the following:
    *   `feat`: A new feature
    *   `fix`: A bug fix
    *   `docs`: Documentation only changes
    *   `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc.)
    *   `refactor`: A code change that neither fixes a bug nor adds a feature
    *   `perf`: A code change that improves performance
    *   `test`: Adding missing tests or correcting existing tests
    *   `build`: Changes that affect the build system or external dependencies (example scopes: pnpm, turbo, docker)
    *   `ci`: Changes to our CI configuration files and scripts (example scopes: GitHub Actions, CircleCI)
    *   `chore`: Other changes that don't modify src or test files
    *   `revert`: Reverts a previous commit
*   **`scope` (optional):** The scope of the change (e.g., `admin-web`, `http-backend`, `db`, `auth`, `ui`). Use `*` for changes affecting multiple scopes.
*   **`subject`**: A very brief summary of the change (imperative, present tense, no period).
*   **`body` (optional):** A longer explanation of the commit message, providing more context.
*   **`footer` (optional):** Reference issues (e.g., `Fixes #123`, `Closes #456`).

**Examples:**

```
feat(user-web): Add user profile editing feature

This commit introduces the ability for users to edit their profile information, including name, email, and password.

Closes #123
```

```
fix(http-backend): Correct authentication middleware bug

Resolves an issue where the authentication middleware was incorrectly validating JWT tokens, leading to unauthorized access for some users.
```

## 🧪 Testing Guidelines

*   **Unit Tests:** Write unit tests for individual functions, components, and modules. Aim for high code coverage.
*   **Integration Tests:** Test the interaction between different modules or services.
*   **End-to-End (E2E) Tests:** (If applicable, describe your E2E testing setup and guidelines).

Run tests using `pnpm test` or `turbo test` from the monorepo root.

## 📚 Documentation Guidelines

*   **READMEs:** Ensure `README.md` files for affected applications/packages are updated.
*   **Code Comments:** Use JSDoc/TSDoc for public APIs. Explain *why* complex code exists, not just *what* it does.
*   **Architectural Documentation:** For significant design decisions, create an [Architectural Decision Record (ADR)](./docs/adr-template.md) in the `docs/adr/` directory.

## 🤝 Code Review Process

All pull requests require at least one approval from a team member before merging. Reviewers will check for:

*   Code quality and adherence to style guides.
*   Correctness and completeness of the solution.
*   Adequate test coverage.
*   Updated documentation.
*   Performance and security considerations.

Thank you for contributing to BookMySportz!
