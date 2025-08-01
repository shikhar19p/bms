// packages/backend-common/src/logger/log-context.ts
``
import { ActorType } from '@workspace/db/client'; // Assuming ActorType enum is in your db package

/**
 * @interface LogContext
 * @description Defines the core contextual information for any log entry.
 * This interface ensures consistency across all log messages and facilitates structured logging.
 */
export interface LogContext {
  // Core Log Metadata (often filled by formatter/transport)
  timestamp?: string; // ISO 8601 string, auto-filled by formatter
  correlationId?: string; // Unique ID for a request/operation, propagated across services
  connectionId?: string; // ✅ ADD THIS: Unique ID for the persistent connection (e.g., WebSocket)
  userId?: string;
  error?: any;

  // Originator? of the Log (Service/Module)
  service?: string; // Name of the microservice/application (e.g., "booking-service", "auth-service")
  module?: string; // Specific module/controller/function within the service
  key?: string; // Key for rate limiting
  limit?: number; // Rate limit count
  windowSeconds?: number; // Rate limit window in seconds
    remaining?: number; // Rate limit remaining count
        resetTime?: number; // Rate limit reset time in seconds
        strategy?: string;
        endpoint?: string; // Endpoint or operation name
        reason?: string; // Reason for rate limit violation
  // Actor Information (who performed the action)
  actorId?: string; // ID of the actor (user ID, admin ID, or system identifier)
  actorType?: ActorType; // Type of actor (USER, ADMIN, SYSTEM, ANONYMOUS)
  actorEmail?: string; // Email of the actor for quick lookup
  ipAddress?: string; // Client IP address
  userAgent?: string; // Client device/browser user-agent string
  sessionId?: string; // Link all activities within a user's session (from TODO)

   recipient?: string;      // E.g., email address or phone number for communication events
    identifier?: string;     // Generic identifier used for lookup (email, phone)
    existingUserId?: string; // Specific to account existence checks during registration/login

  // Request/Response Details (for HTTP requests)
  httpMethod?: string; // HTTP method (GET, POST, PUT, DELETE)
  urlPath?: string; // Full URL path accessed
  statusCode?: number; // HTTP status code of the response
  durationMs?: number; // Duration of the request in milliseconds (from RequestLogContext)
  status?: 'SUCCESS' | 'FAILED' | 'PENDING' | string;
  // Event Categorization & Specifics (Crucial for Audit Logs)
  eventCategory?: string; // e.g., "Authentication", "UserManagement", "Booking", "Payment" (from TODO)
  eventType?: string; // e.g., "UserRegistered", "LoginSuccess", "BookingCreated" (from TODO)
  action?: string; // Specific action performed (e.g., "USER_LOGIN", "VENUE_BOOKED", "PASSWORD_CHANGED") - from Prisma schema
  resourceType?: string; // Type of resource affected (e.g., "ACCOUNT", "VENUE", "BOOKING") - from Prisma schema
  resourceId?: string; // ID of the resource affected (e.g., booking ID, user ID of the target) - from Prisma schema

  // Data Changes (for mutation operations)
  oldValue?: Record<string, any>; // JSON representation of the resource's state BEFORE the action (from Prisma schema)
  newValue?: Record<string, any>; // JSON representation of the resource's state AFTER the action (from Prisma schema)
}

/**
 * @interface RequestLogContext
 * @description Extends LogContext with specific fields relevant to HTTP request logging.
 * This interface is typically used within request logging middleware.
 *
 * @deprecated This interface can largely be merged into LogContext
 * by making its fields optional in LogContext and populating them
 * in the request logging middleware. This simplifies the overall context.
 *
 * For now, keeping it for backward compatibility with your existing code,
 * but recommend merging these fields directly into LogContext.
 */
// export interface RequestLogContext extends LogContext {
//   // These fields are now part of LogContext and should be populated there.
//   // Keeping this interface for now, but its usage should be re-evaluated.
//   method?: string; // Use httpMethod from LogContext
//   path?: string; // Use urlPath from LogContext
//   statusCode?: number; // Use statusCode from LogContext
//   duration?: number; // Use durationMs from LogContext
//   ip?: string; // Use ipAddress from LogContext
// }