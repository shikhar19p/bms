// packages/backend-common/src/middleware/context.ts

import { Request, Response, NextFunction } from 'express';
import { createNamespace, Namespace } from 'cls-hooked';
import { v4 as uuidv4 } from 'uuid';
import { LogContext } from '../logger/log-context';
import { config } from '../config';

/**
 * @constant requestNamespace
 * @description A Continuation-Local Storage (CLS) namespace to store request-scoped context.
 * This allows data like correlation IDs to be accessible across asynchronous calls
 * within the same request lifecycle without explicitly passing them.
 */
export const requestNamespace: Namespace = createNamespace('request');

/**
 * @function contextMiddleware
 * @description Express middleware to establish and populate a request-scoped context
 * using CLS. It generates a correlation ID and captures basic request details.
 * It also provides a hook for authentication middleware to add actor information.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function.
 */
export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Bind the request to the namespace. All subsequent async operations
    // within this request will have access to this context.
    requestNamespace.run(() => {
        // Generate or retrieve correlation ID
        // Prioritize 'x-correlation-id' header if provided by upstream services/gateways
        const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

        // --- ENHANCEMENT: Attach correlationId directly to the request object ---
        // This makes it easily accessible in controllers and other middleware
        // without needing to cast 'req' to 'any' or use getRequestContext()
        // for properties that are simple and always present on the request.
      

        // Set initial request context properties in CLS
        requestNamespace.set('correlationId', correlationId);
        requestNamespace.set('ipAddress', req.ip);
        requestNamespace.set('userAgent', req.headers['user-agent']);
        requestNamespace.set('httpMethod', req.method);
        requestNamespace.set('urlPath', req.originalUrl);
        requestNamespace.set('service', config.log.serviceName);

        // Actor information (actorId, actorEmail, actorType) will be set by your
        // authentication middleware in app.ts, as already implemented.
        // SessionId would also be set by a session management middleware if used.
        requestNamespace.bindEmitter(req);
        requestNamespace.bindEmitter(res);
        next();
    });
};

/**
 * @function getRequestContext
 * @description Helper function to retrieve the current request-scoped context.
 * This can be called from anywhere in your application code (controllers, services)
 * to get contextual logging data. It's particularly useful for accessing context
 * deep within service layers where passing `req` or `correlationId` explicitly
 * might be cumbersome.
 * @returns A partial LogContext object containing available request context.
 */
export function getRequestContext(): Partial<LogContext> {
    return {
        correlationId: requestNamespace.get('correlationId') as string | undefined,
        ipAddress: requestNamespace.get('ipAddress') as string | undefined,
        userAgent: requestNamespace.get('userAgent') as string | undefined,
        httpMethod: requestNamespace.get('httpMethod') as string | undefined,
        urlPath: requestNamespace.get('urlPath') as string | undefined,
        service: requestNamespace.get('service') as string | undefined,
        actorId: requestNamespace.get('actorId') as string | undefined,
        actorEmail: requestNamespace.get('actorEmail') as string | undefined,
        actorType: requestNamespace.get('actorType') as LogContext['actorType'],
        sessionId: requestNamespace.get('sessionId') as string | undefined,
    };
}
