// packages/db/src/index.ts

// Import everything you need to re-export from @prisma/client, including model types
import { PrismaClient,Account, LogLevel, ActorType, AuditLog, TokenType, RoleType, Role } from "@prisma/client"; // Import Role here


/**
 * @constant prismaClient
 * @description A singleton instance of PrismaClient.
 * This instance should be used throughout the application to interact with the database.
 * It's initialized once to manage database connections efficiently.
 */
export const prismaClient = new PrismaClient();

// Re-export necessary types and enums from @prisma/client
// Use 'export type' for types that don't have a runtime representation
export {
  PrismaClient, // PrismaClient is a class, so it's a runtime value
  LogLevel,     // LogLevel is an enum, which has a runtime representation
  ActorType,    // ActorType is an enum, which has a runtime representation
  TokenType,
  RoleType,
};

// ✅ Use 'export type' for model types like AuditLog, as they are purely type definitions
export type {
  AuditLog,
  Account,
  Role, // Add Role here to be re-exported as a type
  // If you re-export other model types (e.g., Venue), they should also use 'export type'
  // Venue,
  // Booking,
  // etc.
};