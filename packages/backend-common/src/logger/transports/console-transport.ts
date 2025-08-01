// packages/backend-common/src/logger/transports/console-transport.ts

import { ILogTransport } from "../i-log-transport";
import { FormattedLogPayload } from "../log-formatter";
import { AppLogLevel } from "../log-level";

/**
 * @class ConsoleTransport
 * @implements ILogTransport
 * @description A log transport that outputs formatted log payloads to the console.
 * It provides human-readable output, often with color coding for different log levels.
 */
export class ConsoleTransport implements ILogTransport {
  constructor() {
    // Optional: Configure colors or specific console formatting here
  }

  async send(log: FormattedLogPayload): Promise<void> {
    const { timestamp, level, message, context, details, error } = log;

    // Determine console color based on log level
    let colorCode = '\x1b[0m'; // Reset color
    switch (level) {
      case AppLogLevel.ERROR:
      case AppLogLevel.FATAL:
        colorCode = '\x1b[31m'; // Red
        break;
      case AppLogLevel.WARN:
        colorCode = '\x1b[33m'; // Yellow
        break;
      case AppLogLevel.INFO:
      case AppLogLevel.SUCCESS: // ✅ Success can be green/cyan
        colorCode = '\x1b[36m'; // Cyan
        break;
      case AppLogLevel.DEBUG:
        colorCode = '\x1b[35m'; // Magenta
        break;
      case AppLogLevel.TRACE:
        colorCode = '\x1b[90m'; // Bright Black (Grey)
        break;
    }

    const logParts = [
      `${colorCode}[${timestamp}] [${level.toUpperCase()}]\x1b[0m`,
      message,
    ];

    if (context && Object.keys(context).length > 0) {
      logParts.push(`\x1b[90mContext:\x1b[0m ${JSON.stringify(context, null, 2)}`);
    }
    if (details) {
      logParts.push(`\x1b[90mDetails:\x1b[0m ${JSON.stringify(details, null, 2)}`);
    }
    if (error) {
      logParts.push(`\x1b[31mError:\x1b[0m ${JSON.stringify(error, null, 2)}`);
    }

    console.log(logParts.join(' '));
  }
}