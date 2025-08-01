// This file augments the Express Request interface to include custom properties.
// It's important for TypeScript to recognize properties like 'correlationId'
// that are added by custom middleware.

declare namespace Express {
  export interface Request {
    correlationId?: string; // Add your custom property
    // You might add other properties set by your middleware here too, e.g.:
    // ipAddress?: string;
    // userAgent?: string | string[];
    // actorId?: string;
    // actorEmail?: string;
    // actorType?: 'User' | 'System' | 'Admin'; // Or your specific enum values
  }
}