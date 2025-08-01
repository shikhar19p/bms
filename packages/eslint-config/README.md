# `eslint-config` Package

This package (`@workspace/eslint-config`) provides a centralized and consistent ESLint configuration for all applications and packages within the BookMySportz monorepo. Its purpose is to enforce code style, identify potential errors, and maintain code quality across the entire codebase.

## 📦 Contents

This package exports several ESLint configurations:

*   `base.js`: Core ESLint rules applicable to all TypeScript/JavaScript files.
*   `next.js`: Specific rules for Next.js applications.
*   `react-internal.js`: Rules for internal React components and libraries.

## 🚀 Usage

To use these configurations in an application or package:

1.  Add `@workspace/eslint-config` to the `devDependencies` in the consuming package's `package.json`:
    ```json
    "devDependencies": {
      "@workspace/eslint-config": "workspace:*",
      // ... other dev dependencies
    }
    ```
2.  Extend the desired configuration in your `.eslintrc.js` or `eslint.config.js` file. For example, in a Next.js application:
    ```javascript
    // eslint.config.js (for ESLint Flat Config)
    import baseConfig from '@workspace/eslint-config/base';
    import nextConfig from '@workspace/eslint-config/next';

    export default [
      ...baseConfig,
      ...nextConfig,
      // Add any project-specific overrides here
    ];
    ```
    Or for older `.eslintrc.js`:
    ```javascript
    // .eslintrc.js
    module.exports = {
      extends: [
        '@workspace/eslint-config/base',
        '@workspace/eslint-config/next',
      ],
      // Add any project-specific overrides here
    };
    ```

## 🛠️ Scripts

This package does not have direct runnable scripts. Its primary function is to provide configurations.

## 📐 Design Principles

*   **Consistency:** Ensures a uniform code style and quality across the entire monorepo.
*   **Maintainability:** Reduces the effort required to manage ESLint rules by centralizing them.
*   **Best Practices:** Incorporates recommended ESLint rules for TypeScript, React, and Next.js development.

## 🧪 Testing

(Not applicable for an ESLint config package.)