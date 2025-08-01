# Error Handling Strategy

This document outlines the standardized approach to error handling across the BookMySportz backend services, primarily focusing on the `http-backend` and `ws-backend` applications. A consistent error handling strategy is crucial for providing clear feedback to clients, simplifying debugging, and ensuring system stability.

## 1. Principles

*   **Centralized Handling:** Errors are caught and processed at a central point to ensure consistency.
*   **Predictable Responses:** API error responses follow a consistent format.
*   **Informative Logging:** Errors are logged with sufficient detail for debugging and monitoring.
*   **Security:** Sensitive information is never exposed in error messages returned to clients.
*   **Operational Visibility:** Critical errors trigger alerts for immediate attention.

## 2. Custom Error Classes

We utilize custom error classes to categorize and provide structured information about different types of errors. These are defined in `@workspace/backend-common/error/`.

### a. `BaseError`

All custom errors extend a `BaseError` class, which provides common properties like `statusCode`, `isOperational`, and `description`.

### b. Domain-Specific Errors

Examples of custom error classes include:

*   `AuthenticationError`: For issues related to user authentication (e.g., invalid credentials, expired token).
*   `AuthorizationError`: For issues related to user permissions (e.g., insufficient privileges).
*   `ValidationError`: For input validation failures (e.g., invalid request body).
*   `NotFoundError`: When a requested resource is not found.
*   `ConflictError`: When a request conflicts with the current state of the resource (e.g., duplicate entry).
*   `ServiceUnavailableError`: When an external dependency is not reachable.

**Example:**

```typescript
// In @workspace/backend-common/error/domain/AuthenticationError.ts
class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed.', details?: any) {
    super('AuthenticationError', StatusCodes.UNAUTHORIZED, message, true, details);
  }
}

// Usage in a service
if (!user || !await bcrypt.compare(password, user.password)) {
  throw new AuthenticationError('Invalid email or password.');
}
```

## 3. Error Handling Middleware (Express.js)

In `http-backend`, a dedicated error handling middleware is used to catch errors thrown by route handlers and other middleware. This middleware is typically the last one registered in the Express application.

*   **Location:** `apps/http-backend/src/middleware/error.middleware.ts` (or similar).
*   **Functionality:**
    *   Identifies the type of error (e.g., `BaseError` instance, native `Error`).
    *   Extracts relevant information (status code, message).
    *   Logs the error using the centralized logger (`@workspace/backend-common/logger`).
    *   Sends a standardized JSON error response to the client.
    *   Distinguishes between operational errors (expected, handled gracefully) and programming errors (unexpected, require immediate attention).

**Example (Simplified):**

```typescript
// In apps/http-backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { BaseError } from '@workspace/backend-common/error/base';
import { logger } from '@workspace/backend-common/logger';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BaseError) {
    logger.error(`Operational Error: ${err.name} - ${err.message}`, { error: err, path: req.path });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.name,
      details: err.details, // Only include non-sensitive details
    });
  } else {
    // Handle unexpected programming errors
    logger.fatal(`Programming Error: ${err.message}`, { error: err, stack: err.stack, path: req.path });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'An unexpected error occurred.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};
```

## 4. Asynchronous Error Handling

For asynchronous operations (e.g., database calls, external API requests), `try-catch` blocks are used within `async` functions. Errors are then either re-thrown as custom errors or handled appropriately.

## 5. Frontend Error Handling

Frontend applications (`admin-web`, `user-web`) are responsible for:

*   Catching errors from API calls.
*   Displaying user-friendly error messages.
*   Logging client-side errors (e.g., to a centralized error tracking service).
*   Handling specific HTTP status codes (e.g., redirecting on 401 Unauthorized).

## 6. Key Considerations

*   **Error Codes:** Use consistent, machine-readable error codes for different error types.
*   **Idempotency:** Ensure that retrying failed operations does not lead to unintended side effects where applicable.
*   **Circuit Breakers:** Implement circuit breakers for external service calls to prevent cascading failures.

This strategy ensures that errors are handled gracefully, providing a better experience for both users and developers.
