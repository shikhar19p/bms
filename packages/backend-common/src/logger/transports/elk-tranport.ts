// packages/backend-common/src/logger/transports/elk-transport.ts

import { ILogTransport } from "../i-log-transport";
import { FormattedLogPayload } from "../log-formatter";

interface ElkTransportOptions {
  endpoint: string; // Base URL of your Elasticsearch instance (e.g., "http://localhost:9200")
  indexName?: string; // Optional: specify a default index name (e.g., "app-logs")
}

export class ElkTransport implements ILogTransport {
  private baseEndpoint: string;
  private indexName: string;

  constructor(options: ElkTransportOptions) {
    if (!options.endpoint) {
      throw new Error('ElkTransport: Endpoint is required.');
    }
    this.baseEndpoint = options.endpoint.endsWith('/') ? options.endpoint : `${options.endpoint}/`;
    this.indexName = options.indexName || 'app-logs';
    console.log(`[ElkTransport] Initialized with endpoint: ${this.baseEndpoint}, indexName: ${this.indexName}`);
  }

  async send(log: FormattedLogPayload): Promise<void> {
    const url = `${this.baseEndpoint}${this.indexName}/_doc`; // Target for indexing a document
    console.log(`[ElkTransport] Attempting to send log to URL: ${url}`);
    console.log(`[ElkTransport] Log payload (stringified): ${JSON.stringify(log).substring(0, 500)}...`); // Log first 500 chars

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });

      if (response.ok) {
        console.log(`[ElkTransport] Log sent successfully. Status: ${response.status}`);
      } else {
        console.warn(`[ElkTransport] Failed to send log. Status: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.warn('[ElkTransport] ELK Response Body for failure:', errorText);
      }
    } catch (error: any) {
      console.error('[ElkTransport] Network or Fetch Error:', error.message);
      if (error.cause) {
        console.error('[ElkTransport] Error Cause:', error.cause);
      }
      console.error('[ElkTransport] Log that failed:', log);
    }
  }
}