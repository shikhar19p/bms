//packages/src/error/base/http-error.ts
import { getReasonPhrase} from 'http-status-codes';

interface HttpErrorOptions {
  errorCode?: string;
  details?: any;
  cause?: Error;
}

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly details?: any;

  constructor(
    statusCode: number,
    message?: string,
    options?: HttpErrorOptions
  ) {
    super(message || getReasonPhrase(statusCode));
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = options?.errorCode;
    this.details = options?.details;

    if (options?.cause) {
      this.stack += `\nCaused by: ${options.cause.stack}`;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  serializeErrors() {
    return [
      {
        message: this.message,
        errorCode: this.errorCode,
        details: this.details,
      },
    ];
  }
}
