# Backend Testing Guide

This document provides a detailed guide to testing the backend services (`http-backend`, `ws-backend`) and related shared packages (`backend-common`, `db`, `common`) within the BookMySportz monorepo. It covers various testing types, recommended tools, and best practices for ensuring robust, secure, and performant backend systems.

## 1. Testing Philosophy

Our backend testing strategy follows the Testing Pyramid, emphasizing a strong foundation of unit tests, followed by integration tests, and then API/contract tests.

## 2. Types of Backend Tests

### a. Unit Tests (Functions, Classes, Modules)

*   **Purpose:** To test individual functions, methods, classes, or small modules in isolation, ensuring their internal logic works correctly.
*   **Scope:**
    *   **`http-backend`, `ws-backend`:** Individual controller methods (without Express context), service methods, utility functions, validation logic.
    *   **`backend-common`:** All utility functions, custom error classes, middleware logic (in isolation).
    *   **`db`:** Prisma client extensions, custom database helpers, seeding functions.
    *   **`common`:** Utility functions, enum definitions, schema definitions.
*   **Tools:**
    *   **Jest:** The primary test runner and assertion library.
    *   **`ts-jest`:** For running Jest tests on TypeScript files.
    *   **`jest-mock-extended`:** For easily creating type-safe mocks of interfaces and classes.
*   **Best Practices:**
    *   **Isolation:** Mock all external dependencies (e.g., Prisma client, external API calls, other services) to ensure tests are fast and deterministic.
    *   **Pure Functions:** Prioritize testing pure functions (functions that produce the same output for the same input and have no side effects) extensively.
    *   **Edge Cases:** Test boundary conditions, invalid inputs, and error scenarios.
    *   **Clear Naming:** Test files and test cases should clearly describe what is being tested.
*   **Example (Conceptual - Service Method):**
    ```typescript
    // apps/http-backend/src/services/auth-service/user/login.service.test.ts
    import { loginUser } from './login.service';
    import { prismaClient } from '@workspace/db/client';
    import bcrypt from 'bcryptjs';

    jest.mock('@workspace/db/client', () => ({
      prismaClient: {
        account: {
          findUnique: jest.fn(),
        },
      },
    }));
    jest.mock('bcryptjs');

    describe('loginUser', () => {
      it('should return tokens on successful login', async () => {
        (prismaClient.account.findUnique as jest.Mock).mockResolvedValue({
          id: 'user-123', email: 'test@example.com', password: 'hashedPassword', role: { name: 'USER' }
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await loginUser('test@example.com', 'password123');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
      });

      it('should throw error for invalid credentials', async () => {
        (prismaClient.account.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(loginUser('nonexistent@example.com', 'password')).rejects.toThrow('Invalid credentials');
      });
    });
    ```

### b. Integration Tests (Module Interactions, Database, External Services)

*   **Purpose:** To verify the interactions between multiple units or modules, including database interactions and integrations with external services.
*   **Scope:**
    *   **Controller-Service-Database Flow:** Testing an API endpoint from the controller through the service layer to the database.
    *   **Middleware Chains:** Ensuring multiple middleware functions work correctly in sequence.
    *   **Service-to-Service Communication:** (If applicable, e.g., `http-backend` calling `ws-backend` internally).
    *   **External Service Integration:** Testing interactions with SMS gateways, email services, etc.
*   **Tools:**
    *   **Jest:** Test runner.
    *   **Supertest:** For making HTTP requests to the Express.js application, allowing testing of full request/response cycles.
    *   **Test Containers (or Docker Compose for tests):** For spinning up actual database instances (e.g., PostgreSQL) for integration tests, ensuring a realistic environment.
    *   **MSW (Mock Service Worker) or `nock`:** For mocking external HTTP requests.
*   **Best Practices:**
    *   **Dedicated Test Database:** Always use a separate, isolated database for integration tests. Clean up data before/after each test suite.
    *   **Realistic Data:** Populate the test database with realistic data for test scenarios.
    *   **Focus on Flow:** Test the complete flow of a feature, not just individual parts.
    *   **Controlled Externalities:** Mock external services that are not the primary focus of the integration test.
*   **Example (Conceptual - API Endpoint):**
    ```typescript
    // apps/http-backend/src/routes/auth-routes/user/auth.routes.test.ts
    import request from 'supertest';
    import app from '../../../app'; // Your Express app instance
    import { prismaClient } from '@workspace/db/client';

    describe('Auth API', () => {
      beforeAll(async () => {
        // Setup test database, e.g., clear tables, seed initial data
        await prismaClient.$connect();
        // ... seed test user
      });

      afterAll(async () => {
        // Clean up test database
        await prismaClient.$disconnect();
      });

      it('POST /api/auth/login should return 200 and tokens for valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
      });

      it('POST /api/auth/login should return 401 for invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Invalid credentials');
      });
    });
    ```

### c. API Contract Tests

*   **Purpose:** To ensure that the backend API adheres to its defined specification (contract), preventing breaking changes and ensuring compatibility with frontend and other consuming services.
*   **Scope:** All public-facing API endpoints of `http-backend`.
*   **Tools:**
    *   **OpenAPI/Swagger:** Define your API contract using OpenAPI specification.
    *   **Dredd, Pact, or Postman/Newman:** Tools that can validate API responses against the OpenAPI schema or perform consumer-driven contract testing.
*   **Best Practices:**
    *   **Schema-First Development:** Design the API contract before implementation.
    *   **Automated Validation:** Integrate contract tests into the CI pipeline.
    *   **Consumer-Driven Contracts (Pact):** For microservice architectures, ensure that each service's API meets the expectations of its consumers.

### d. Performance Tests (Load & Stress)

*   **Purpose:** To evaluate the backend's responsiveness, stability, and scalability under various load conditions.
*   **Scope:** `http-backend` and `ws-backend`.
*   **Tools:**
    *   **JMeter, K6, Artillery:** For simulating high concurrency and measuring metrics like response time, throughput, error rate, and resource utilization.
*   **Best Practices:**
    *   **Realistic Scenarios:** Design test scripts that mimic real user behavior and traffic patterns.
    *   **Monitor Backend Metrics:** Use monitoring tools (e.g., Prometheus, Grafana) to observe CPU, memory, network I/O, and database performance during tests.
    *   **Identify Bottlenecks:** Analyze results to pinpoint performance bottlenecks (e.g., slow database queries, inefficient code).

### e. Security Tests

*   **Purpose:** To identify vulnerabilities in the backend code and configurations.
*   **Scope:** `http-backend`, `ws-backend`, and all backend-related packages.
*   **Tools:**
    *   **SAST (Static Application Security Testing):** Tools like Snyk, SonarQube, or ESLint security plugins for scanning source code and dependencies for known vulnerabilities.
    *   **DAST (Dynamic Application Security Testing):** Tools like OWASP ZAP or Burp Suite for actively scanning the running application for vulnerabilities (e.g., SQL injection, XSS, broken authentication).
    *   **Manual Penetration Testing:** Conducted by security experts.
*   **Best Practices:**
    *   **Regular Scans:** Integrate automated SAST/DAST into the CI/CD pipeline.
    *   **Dependency Audits:** Regularly check for vulnerabilities in third-party libraries.
    *   **Secure Coding Practices:** Adhere to OWASP Top 10 guidelines during development.

## 3. Monorepo Specifics

*   **Turborepo:** Configure `turbo.json` to run backend tests efficiently, leveraging caching and parallel execution.
*   **Shared Test Utilities:** Create a `packages/test-utils/backend` (or similar) to centralize common test helpers, mock Prisma clients, and test data factories.
*   **Docker for Testing:** Use `docker-compose.test.yml` to define a test environment that includes all necessary services (database, Redis, etc.) for integration and E2E tests.

## 4. CI/CD Integration

Backend tests are a critical part of the CI/CD pipeline:

*   **Unit & Integration Tests:** Run on every pull request and merge to `develop`/`main`.
*   **API Contract Tests:** Run on every build to ensure API compatibility.
*   **Security Scans:** Integrated into the build process.

By implementing this comprehensive backend testing strategy, we ensure the BookMySportz backend services are robust, secure, and performant.
