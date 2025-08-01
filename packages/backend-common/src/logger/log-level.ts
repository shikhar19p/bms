// packages/backend-common/src/logger/log-level.ts

/**
 * @enum AppLogLevel
 * @description Defines the standard logging levels for the application.
 * These levels are used internally by the logger and mapped to external formats.
 */
export enum AppLogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
  SUCCESS = 'success', // ✅ Added for explicit audit success events
}

/**
 * @type LogLevel
 * @description A union type for convenience, representing all possible AppLogLevel values.
 * This ensures type safety when referring to log levels.
 */
export type LogLevel = AppLogLevel; // ✅ Simplified to directly use the enum values

/**
 * @function toPrismaLogLevel
 * @description Converts an internal AppLogLevel to its uppercase string representation
 * suitable for Prisma's database enum (e.g., 'INFO', 'SUCCESS').
 * @param level The AppLogLevel to convert.
 * @returns The uppercase string representation.
 */
export const toPrismaLogLevel = (level: AppLogLevel): string => {
  return level.toUpperCase();
};

/**
 * @function logLevelToFileName
 * @description Generates a filename based on the log level. Useful for file transports
 * to categorize logs (e.g., 'error.log', 'debug.log').
 * @param level The AppLogLevel.
 * @returns A string representing the filename.
 */
export const logLevelToFileName = (level: AppLogLevel): string => {
  return `${level}.log`; // e.g., error.log, debug.log
};

/**
 * @function fromStringToLogLevel
 * @description Converts a string representation of a log level back to its AppLogLevel enum.
 * Useful for parsing log levels from configuration or external sources.
 * @param level The string to convert.
 * @returns The corresponding AppLogLevel, or undefined if not found.
 */
export const fromStringToLogLevel = (level: string): AppLogLevel | undefined => {
  const normalized = level.toLowerCase();
  // ✅ Use Object.values(AppLogLevel) directly for checking
  if (Object.values(AppLogLevel).includes(normalized as AppLogLevel)) {
    return normalized as AppLogLevel;
  }
  return undefined;
};