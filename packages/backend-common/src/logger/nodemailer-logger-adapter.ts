// packages/backend-common/src/logger/nodemailer-logger-adapter.ts

import { ILogger } from './i-logger'; // Your custom ILogger interface
import { LogContext } from './log-context'; // Your custom LogContext

/**
 * @class NodemailerLoggerAdapter
 * @description Adapts the custom AppLogger to be compatible with Nodemailer's internal logger interface.
 * Nodemailer expects synchronous methods (debug, info, warn, error) that take a single string message.
 */
export class NodemailerLoggerAdapter {
    constructor(private readonly appLogger: ILogger) {}

    // Method to create the Nodemailer-compatible logger object
    public getLogger(baseContext: LogContext = {}): {
        debug: (msg: string) => void;
        info: (msg: string) => void;
        warn: (msg: string) => void;
        error: (msg: string) => void;
    } {
        return {
            debug: (msg: string) => {
                // We don't await here as Nodemailer's logger expects synchronous calls.
                // Your appLogger.debug internally handles its async transports.
                this.appLogger.debug(`[Nodemailer] ${msg}`, { ...baseContext, module: 'Nodemailer' });
            },
            info: (msg: string) => {
                this.appLogger.info(`[Nodemailer] ${msg}`, { ...baseContext, module: 'Nodemailer' });
            },
            warn: (msg: string) => {
                this.appLogger.warn(`[Nodemailer] ${msg}`, { ...baseContext, module: 'Nodemailer' });
            },
            error: (msg: string) => {
                this.appLogger.error(`[Nodemailer] ${msg}`, { ...baseContext, module: 'Nodemailer' });
            },
            // Nodemailer doesn't typically call 'trace' or 'fatal' directly on its logger option.
            // If you need more granular control, you might need to adjust Nodemailer's logger option
            // (e.g., if it allowed a custom logger instance that adheres to a broader interface).
            // For standard usage, these four are sufficient.
        };
    }
}