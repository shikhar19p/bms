# Frontend Testing Guide

This document provides a detailed guide to testing the frontend applications (`admin-web`, `user-web`) and the shared UI package (`ui`) within the BookMySportz monorepo. It elaborates on the types of tests, recommended tools, and best practices for ensuring high-quality, maintainable, and accessible user interfaces.

## 1. Testing Philosophy

Our frontend testing strategy aligns with the Testing Pyramid, prioritizing fast and isolated tests at the unit level, followed by integration and end-to-end tests.

## 2. Types of Frontend Tests

### a. Unit Tests (Components, Hooks, Utilities)

*   **Purpose:** To verify the smallest testable parts of the UI in isolation. This includes individual React components (especially presentational or pure components), custom hooks, and utility functions.
*   **Scope:**
    *   **`ui` package:** All components, hooks, and utility functions.
    *   **`admin-web`, `user-web`:** Page-specific components, custom hooks, and utility functions that are not part of the shared `ui` package.
*   **Tools:**
    *   **Jest:** The test runner and assertion library.
    *   **React Testing Library (RTL):** The preferred library for testing React components. RTL encourages testing components from the user's perspective, focusing on behavior rather than internal implementation details. This leads to more robust and maintainable tests.
*   **Best Practices:**
    *   **Render and Assert:** Render the component, interact with it as a user would, and assert on the resulting DOM changes.
    *   **Avoid Implementation Details:** Do not test internal state or private methods directly. Test the public API and observable behavior.
    *   **Mock Dependencies:** Mock API calls, external services, or complex child components to keep tests fast and isolated.
    *   **Snapshot Testing (Use Sparingly):** Can be used for simple, static components to ensure UI doesn't change unexpectedly, but prefer RTL for behavioral testing.
    *   **Accessibility (A11y) Integration:** Use `jest-axe` with RTL to automatically check for common accessibility violations.
*   **Example (Conceptual):**
    ```typescript
    // ui/components/button/Button.test.tsx
    import { render, screen } from '@testing-library/react';
    import userEvent from '@testing-library/user-event';
    import { Button } from './Button';
    import { axe, toHaveNoViolations } from 'jest-axe';

    expect.extend(toHaveNoViolations);

    describe('Button', () => {
      it('renders with correct text', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
      });

      it('calls onClick when clicked', async () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        await userEvent.click(screen.getByRole('button', { name: /click me/i }));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('is accessible', async () => {
        const { container } = render(<Button>Accessible Button</Button>);
        expect(await axe(container)).toHaveNoViolations();
      });
    });
    ```

### b. Integration Tests (Component Interactions, State Management)

*   **Purpose:** To verify that multiple components or modules work correctly together, especially when involving shared state, context, or data flow.
*   **Scope:**
    *   Components interacting with React Context.
    *   Components that fetch data and display it.
    *   Forms with multiple input fields and validation logic.
*   **Tools:**
    *   **Jest & React Testing Library:** Still the primary tools, but tests involve rendering larger component trees.
    *   **MSW (Mock Service Worker):** For mocking API requests at the network level, providing a realistic testing environment without hitting actual backend services.
*   **Best Practices:**
    *   **Realistic Scenarios:** Simulate user interactions that span across multiple components.
    *   **Mock API Calls:** Use MSW to intercept and respond to network requests, ensuring consistent and controlled data for tests.
    *   **Test User Flows:** Focus on testing a small, isolated user flow rather than a single component.

### c. End-to-End (E2E) Tests

*   **Purpose:** To simulate real user journeys through the entire application, from the browser UI to the backend services and database. These tests ensure that critical business flows work as expected in a production-like environment.
*   **Scope:** Critical user paths in `admin-web` and `user-web`.
    *   User registration, login, and logout.
    *   Venue search, selection, and booking process.
    *   Admin approval workflows.
    *   Profile updates.
*   **Tools:**
    *   **Cypress or Playwright:** Both are excellent choices. They provide a full browser environment, automatic waiting, and powerful debugging capabilities.
*   **Best Practices:**
    *   **Focus on Business Value:** Test the most important user stories and critical paths.
    *   **Dedicated Test Environment:** Run E2E tests against a deployed staging environment or a locally spun-up full stack.
    *   **Data Setup/Teardown:** Ensure tests start from a known state and clean up any created data.
    *   **Resilience:** Use explicit waits and retries to make tests less flaky.
    *   **Visual Regression Testing (Optional):** Integrate tools like `percy.io` or `chromatic.com` with Storybook/Cypress to catch unintended UI changes.

### d. Accessibility (A11y) Testing

*   **Purpose:** To ensure the application is usable by individuals with disabilities.
*   **Scope:** All UI components and pages.
*   **Tools:**
    *   **`jest-axe`:** Integrates `axe-core` into Jest unit tests for automated accessibility checks.
    *   **Lighthouse:** A Google tool built into Chrome DevTools for auditing web page accessibility (and performance, SEO, best practices).
    *   **Manual Testing:** Crucial for catching issues that automated tools miss. Involves using screen readers, keyboard navigation, and other assistive technologies.
*   **Best Practices:**
    *   **Integrate Early:** Make accessibility a consideration from design to development.
    *   **Semantic HTML:** Use appropriate HTML elements for their intended purpose.
    *   **Keyboard Navigation:** Ensure all interactive elements are reachable and operable via keyboard.
    *   **ARIA Attributes:** Use ARIA attributes correctly when semantic HTML is not sufficient.

## 3. Monorepo Specifics

*   **`turbo test`:** Leverage Turborepo to run tests efficiently across all frontend workspaces. Configure `turbo.json` to define inputs and outputs for caching test results.
*   **Workspace-Specific Configurations:** Each frontend workspace (`admin-web`, `user-web`, `ui`) will have its own `jest.config.js` (or similar) to manage specific test setups.
*   **Shared Test Utilities:** Consider creating a `packages/test-utils/frontend` (or similar) to centralize common test helpers, custom render functions for RTL, and mock data that can be shared across frontend applications.

## 4. CI/CD Integration

Frontend tests are an integral part of the CI/CD pipeline:

*   **Unit & Integration Tests:** Run on every pull request and merge to `develop`/`main`.
*   **E2E Tests:** Typically run on successful deployments to staging environments.
*   **Accessibility Audits:** Can be integrated into CI using Lighthouse CI or similar tools.

By following this guide, we aim to build highly reliable, performant, and accessible frontend experiences for BookMySportz.
