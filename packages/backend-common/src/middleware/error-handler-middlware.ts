// packages/backend-common/src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { logger  } from '../logger'; // Import your logger and LogLevel enum
import { getRequestContext } from './context'; // Import the context helper
import { config } from '../config'; // Assuming you have a config module for NODE_ENV

/**
 * @function errorHandler
 * @description Express middleware to catch and handle unhandled errors.
 * It logs the error with full details (including stack trace and request context)
 * and sends a standardized error response to the client.
 * It also triggers an audit log for critical errors.
 * @param err The error object.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function (not typically called in a final error handler).
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Determine the appropriate HTTP status code
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Retrieve request-scoped context
    const context = getRequestContext();

    // Log the error using the main application logger
    // Pass the original error object as the fourth argument for full details
    logger.error(
        'Unhandled Application Error',
        {
            ...context, // Spread all available context properties
            statusCode: statusCode, // Add status code to context for this log
            module: 'errorHandler',
        },
        // Details about the error context
        {
            requestBody: req.body, // Log request body (be careful with sensitive data!)
            requestHeaders: req.headers, // Log request headers
        },
        // The actual error object for stack trace and specific properties
        {
            name: err.name || 'Error',
            message: message,
            stackTrace: err.stack,
            // Add any custom error properties here, e.g., err.errorCode
            errorCode: err.errorCode,
        }
    );

    // ✅ Trigger an audit log for critical errors (e.g., 5xx status codes)
    if (statusCode >= 500) {
        logger.fatal(
            'Critical System Error Detected',
            {
                ...context,
                action: 'SYSTEM_ERROR',
                resourceType: 'APPLICATION',
                resourceId: context.service || 'N/A', // Use service name as resource ID
                actorId: context.actorId || 'SYSTEM', // Default actor for system errors
                actorType: context.actorType || 'SYSTEM',
                statusCode: statusCode,
                module: 'errorHandler',
            },
            // Details about the error for audit purposes
            {
                errorMessage: message,
                requestUrl: req.originalUrl,
                httpMethod: req.method,
            },
            // The full error object for audit details
            {
                name: err.name,
                message: err.message,
                stackTrace: err.stack,
            }
        );
    }

    // Send a standardized error response to the client
    res.status(statusCode).json({
        status: 'error',
        message: config.env === 'production' ? 'An unexpected error occurred.' : message,
        // Only send stack trace in non-production environments for security
        ...(config.env !== 'production' && { stack: err.stack }),
    });
};