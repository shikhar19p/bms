// packages/backend-common/src/logger/i-logger.ts

import { LogContext } from "./log-context";


/**
 * @interface ILogger
 * @description Defines the contract for any logger implementation in the application.
 * This interface promotes consistency and allows for easy swapping of logger backends.
 */
export interface ILogger {
  child(context: LogContext): ILogger;
  /**
   * Logs a message at the TRACE level.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace.
   */
  trace(message: string, context?: LogContext, details?: any, error?: any): Promise<void>; // ✅ Added Promise<void>
  /**
   * Logs a message at the DEBUG level.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace.
   */
  debug(message: string, context?: LogContext, details?: any, error?: any): Promise<void>;
  /**
   * Logs a message at the INFO level.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace.
   */
  info(message: string, context?: LogContext, details?: any, error?: any): Promise<void>;
  /**
   * Logs a message at the WARN level.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace.
   */
  warn(message: string, context?: LogContext, details?: any, error?: any): Promise<void>;
  /**
   * Logs a message at the ERROR level.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace.
   */
  error(message: string, context?: LogContext, details?: any, error?: any): Promise<void>;
  /**
   * Logs a message at the FATAL level, indicating a critical, unrecoverable error.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace.
   */
  fatal(message: string, context?: LogContext, details?: any, error?: any): Promise<void>;
  /**
   * Logs a message at the SUCCESS level, typically used for audit trails of successful operations.
   * @param message The main log message.
   * @param context Optional structured context related to the log event.
   * @param details Optional additional details, typically a JSON-serializable object.
   * @param error Optional error object, including stack trace (though less common for success).
   */
  success(message: string, context?: LogContext, details?: any, error?: any): Promise<void>; // ✅ Added success method
}