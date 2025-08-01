# `ui` Package

This package (`@workspace/ui`) provides a collection of reusable UI components and design system elements for the BookMySportz monorepo. Its purpose is to ensure a consistent look and feel across all frontend applications (`admin-web`, `user-web`) and accelerate UI development.

## 📦 Contents

This package includes:

*   **`components/`**: Reusable React components (e.g., buttons, forms, navigation elements).
*   **`hooks/`**: Custom React hooks for common UI logic.
*   **`lib/`**: Utility functions related to UI (e.g., `cn` for Tailwind CSS class merging).
*   **`styles/`**: Global CSS and Tailwind CSS configurations.

## 🚀 Usage

To use components or utilities from this package in a frontend application:

1.  Add `@workspace/ui` to the `dependencies` in the consuming application's `package.json`:
    ```json
    "dependencies": {
      "@workspace/ui": "workspace:*",
      // ... other dependencies
    }
    ```
2.  Import and use the desired components or utilities:
    ```typescript
    import { Button } from '@workspace/ui/components/button';
    import { useTheme } from '@workspace/ui/hooks/use-theme';
    // ...
    ```
3.  Ensure your application's `postcss.config.mjs` and `tailwind.config.ts` are correctly configured to include the `ui` package's styles.

## 🛠️ Scripts

*   `pnpm lint`: Runs ESLint checks for the UI components.

## 🎨 Design Principles & Patterns

This package follows:

*   **Component-Driven Development:** Components are developed in isolation and are highly reusable.
*   **Atomic Design Principles:** Components are organized from smallest (atoms) to largest (pages).
*   **Accessibility:** Components are built with accessibility in mind.
*   **Theming:** Supports theming (e.g., dark mode) via `next-themes`.
*   **Utility-First CSS:** Leverages Tailwind CSS for styling.
*   **Radix UI:** Utilizes Radix UI primitives for unstyled, accessible components.

## 🧪 Testing

(Add details on how to run tests for `ui` if applicable, e.g., `pnpm test` and what framework is used.)
