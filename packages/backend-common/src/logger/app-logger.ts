// packages/backend-common/src/logger/app-logger.ts

import { AppLogLevel } from "./log-level"; // ✅ Use AppLogLevel
import { LogContext } from "./log-context"; // ✅ Use LogContext
import { LogFormatter, FormattedLogPayload } from "./log-formatter"; // ✅ Import FormattedLogPayload
import { ILogger } from "./i-logger";
import { ILogTransport } from "./i-log-transport";

/**
 * @class AppLogger
 * @implements ILogger
 * @description The main application logger responsible for orchestrating log events.
 * It formats log data and dispatches it to various registered transports.
 */
export class AppLogger implements ILogger {
  private defaultContext: LogContext;

  constructor(private readonly transports: ILogTransport[], defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
  }

  public child(context: LogContext): ILogger {
    return new AppLogger(this.transports, { ...this.defaultContext, ...context });
  }


  /**
   * Internal helper to format and send log payload to all transports.
   * @param level The log level.
   * @param message The log message.
   * @param context Optional log context.
   * @param details Optional additional details.
   * @param error Optional error object.
   */
  private async _sendLog(
    level: AppLogLevel,
    message: string,
    context?: LogContext,
    details?: any,
    error?: any
  ): Promise<void> {
    const mergedContext = { ...this.defaultContext, ...context };
    const logPayload: FormattedLogPayload = LogFormatter.format(level, message, mergedContext, details, error);

    // Use Promise.allSettled to ensure all transports are attempted,
    // and we can log any failures of individual transports without
    // stopping other transports or throwing an unhandled promise rejection.
    const results = await Promise.allSettled(
      this.transports.map((transport) => transport.send(logPayload))
    );

    // ✅ Optional: Log transport failures internally
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Logger: Transport[${index}] failed to send log:`, result.reason);
        // You might want to send this to a fallback transport or monitoring system
        // to alert on logging failures.
      }
    });
  }

  // ✅ Implement all methods from ILogger interface
  async trace(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.TRACE, message, context, details, error);
  }

  async debug(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.DEBUG, message, context, details, error);
  }

  async info(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.INFO, message, context, details, error);
  }

  async warn(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.WARN, message, context, details, error);
  }

  async error(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.ERROR, message, context, details, error);
  }

  async fatal(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.FATAL, message, context, details, error);
  }

  async success(message: string, context?: LogContext, details?: any, error?: any): Promise<void> {
    await this._sendLog(AppLogLevel.SUCCESS, message, context, details, error);
  }
}