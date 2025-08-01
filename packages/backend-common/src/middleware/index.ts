// packages/backend-common/src/middleware/index.ts

/**
 * @module @repo/backend-common/middleware
 * @description Centralized exports for common Express middleware used across backend services.
 */

// ✅ Export all individual middleware functions
export { contextMiddleware, getRequestContext, requestNamespace } from './context';
export { requestLogger } from './request-logger';
export { errorHandler } from './error-handler-middlware';
export { validate } from './validation.middleware';
