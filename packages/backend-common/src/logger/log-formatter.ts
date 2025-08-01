// packages/backend-common/src/logger/log-formatter.ts

import { LogContext } from "./log-context";
import { AppLogLevel } from "./log-level"; // ✅ Use AppLogLevel

/**
 * @interface FormattedLogPayload
 * @description Defines the structure of the final log object that will be sent to transports.
 * This ensures consistency across all log entries.
 */
export interface FormattedLogPayload {
  timestamp: string;
  level: AppLogLevel; // ✅ Use AppLogLevel
  message: string;
  context?: LogContext; // ✅ Wrap context in its own property for clarity and better structure
  details?: any; // Can be any JSON-serializable data
  error?: {
    name?: string; // ✅ Added error name
    code?: string;
    message?: string;
    stackTrace?: string;
    // Add other relevant error properties if needed (e.g., originalError)
  };
}

/**
 * @class LogFormatter
 * @description Responsible for structuring raw log inputs into a consistent, machine-readable format.
 * This class ensures that all log entries adhere to a predefined schema before being sent to transports.
 */
export class LogFormatter {
  /**
   * Formats log data into a standardized payload.
   * @param level The logging level.
   * @param message The main log message.
   * @param context Optional structured context.
   * @param details Optional additional details.
   * @param error Optional error object.
   * @returns A formatted log payload.
   */
  static format(
    level: AppLogLevel, // ✅ Use AppLogLevel
    message: string,
    context?: LogContext, // ✅ Use LogContext
    details?: any,
    error?: any
  ): FormattedLogPayload {
    const formattedError = error ? {
      name: error.name, // ✅ Capture error name
      code: error.code,
      message: error.message,
      stackTrace: error.stack
    } : undefined;

    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || undefined, // ✅ Wrap context in its own property
      details,
      error: formattedError
    };
  }
}