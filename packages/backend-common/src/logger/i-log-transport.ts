// packages/backend-common/src/logger/i-log-transport.ts

import { FormattedLogPayload } from "./log-formatter"; // ✅ Import FormattedLogPayload

/**
 * @interface ILogTransport
 * @description Defines the contract for any log transport mechanism.
 * Transports are responsible for sending formatted log payloads to their respective destinations.
 */
export interface ILogTransport {
  /**
   * Sends a formatted log payload to the transport's destination.
   * @param log The formatted log payload to send.
   * @returns A Promise that resolves when the log has been sent (or queued for sending).
   */
  send(log: FormattedLogPayload): Promise<void>; // ✅ Use FormattedLogPayload
}