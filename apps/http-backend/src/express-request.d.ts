// apps/http-backend/src/express-request.d.ts

// 1. First import the types you want to augment
import 'express-serve-static-core';

// 2. Then declare the module and augment its Request interface
declare module 'express-serve-static-core' {
  interface Request {
    /** Globally available correlation ID, set by contextMiddleware */
    correlationId: string;
    /** User ID, set by authMiddleware */
    userId: string;
  }
}
