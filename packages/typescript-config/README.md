# `typescript-config` Package

This package (`@workspace/typescript-config`) provides a centralized and consistent TypeScript configuration for all applications and packages within the BookMySportz monorepo. Its purpose is to ensure type safety, consistency, and reduce duplication of TypeScript compiler options across the entire codebase.

## 📦 Contents

This package exports several base TypeScript configurations:

*   `base.json`: Core TypeScript compiler options applicable to all TypeScript projects.
*   `nextjs.json`: Specific configurations for Next.js applications.
*   `react-library.json`: Configurations for React libraries or components.

## 🚀 Usage

To use these configurations in an application or package:

1.  Add `@workspace/typescript-config` to the `devDependencies` in the consuming package's `package.json`:
    ```json
    "devDependencies": {
      "@workspace/typescript-config": "workspace:*",
      // ... other dev dependencies
    }
    ```
2.  Extend the desired configuration in your `tsconfig.json` file. For example, in a Next.js application:
    ```json
    // tsconfig.json
    {
      "extends": "@workspace/typescript-config/nextjs.json",
      "compilerOptions": {
        // Add any project-specific overrides here
      },
      "include": [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx"
      ],
      "exclude": [
        "node_modules"
      ]
    }
    ```

## 🛠️ Scripts

This package does not have direct runnable scripts. Its primary function is to provide configurations.

## 📐 Design Principles

*   **Consistency:** Ensures a uniform TypeScript setup across the entire monorepo.
*   **Maintainability:** Reduces the effort required to manage TypeScript compiler options by centralizing them.
*   **Best Practices:** Incorporates recommended TypeScript configurations for various project types.

## 🧪 Testing

(Not applicable for a TypeScript config package.)