// packages/backend-common/src/middleware/requestLogger.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger'; // Import your custom logger
import { getRequestContext } from './context'; // Import the context helper

/**
 * @function requestLogger
 * @description Express middleware to log details of incoming HTTP requests and their responses.
 * It captures request method, URL, status code, response time, and other contextual information.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime(); // Start timer for response time calculation

    // Listen for the 'finish' event on the response object, which indicates
    // that the response has been sent to the client.
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds

        // Retrieve request-scoped context
        const context = getRequestContext();

        // Log the HTTP request completion
        logger.info('HTTP Request Completed', {
            ...context, // Spread all available context properties
            statusCode: res.statusCode,
            durationMs: parseFloat(durationMs.toFixed(2)), // Format to 2 decimal places
        });
    });

    next(); // Pass control to the next middleware in the chain
};