// packages/backend-common/src/logger/index.ts

import { AppLogger } from "./app-logger";
import { ConsoleTransport } from "./transports/console-transport";
import { FileTransport } from "./transports/file-transport"; // ✅ Assuming you have this
import { DbTransport } from "./transports/db-transport";     // ✅ For audit logs
import { ElkTransport } from "./transports/elk-tranport";   // ✅ For centralized app logs
import { ILogger } from "./i-logger"; // Import ILogger for type safety of exported logger
import { config } from '../config'; 
/**
 * @module @repo/backend-common/logger
 * @description Centralized logger configuration and instantiation for backend services.
 * This module exports a singleton logger instance for use throughout the application.
 */

// Instantiate all necessary transports
// Pass any necessary configurations to transports (e.g., file paths, ELK endpoints, Prisma client)
const transports = [
  new ConsoleTransport(), // For local development/debugging
  new FileTransport(),    // For local file logging (with rotation)
  new DbTransport(), // Assuming DbTransport takes prismaClient
  // Conditionally instantiate ElkTransport with correct endpoint and indexName
  ...(config.log.elkEndpoint ? [new ElkTransport({
      endpoint: config.log.elkEndpoint,
      indexName: 'bms-app-logs' // ✅ Choose a distinct index name for your app logs
  })] : []),
];

/**
 * @constant logger
 * @description The singleton instance of the application logger.
 * Use this instance throughout your backend services to log events.
 */
export const logger: ILogger = new AppLogger(transports);

// ✅ Only export the logger instance and core types that consumers need to interact with
export { AppLogLevel as LogLevel } from "./log-level"; // Re-export AppLogLevel as LogLevel for convenience
export type { LogContext } from "./log-context";
export type { ILogger } from "./i-logger"; // Export type only
export {NodemailerLoggerAdapter} from './nodemailer-logger-adapter'
// Removed:
// export * from "./app-logger"; // Don't expose the implementation details
// export * from "./i-log-transport"; // Internal detail
// export * from "./log-context"; // Moved to dedicated file and re-exported as type