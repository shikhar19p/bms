// bms-monorepo/apps/http-backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@workspace/backend-common/config';
import { requestNamespace, getRequestContext } from '@workspace/backend-common/middleware';
import { prismaClient as prisma, ActorType } from '@workspace/db/client';
import { logger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';

/**
 * Interface describing the JWT token payload.
 */
interface TokenPayload {
    sub: string; // Unique account identifier (userId)
    role: string; // Role name (e.g., "USER", "VENUE_OWNER")
    permissions: string[];
    iat: number;
    exp: number;
    iss: string;
}

// Extend the Express Request interface to include the authenticated user's data
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
                permissions: string[];
            };
        }
    }
}

/**
 * @class AuthenticationMiddleware
 * @description Encapsulates all authentication and authorization logic in a reusable class.
 * This follows LLD by separating concerns and creating a clear, testable, and maintainable structure.
 */
class AuthenticationMiddleware {
    /**
     * Primary authentication middleware.
     *
     * Verifies the JWT from the Authorization header. If the token is valid, it fetches
     * the user's current data from the database and attaches it to `req.user`.
     *
     * This middleware DOES NOT fail if the token is missing or invalid. It simply leaves
     * `req.user` undefined. This allows it to be used on all routes to identify users
     * when possible, while the `requireAuth` middleware is used to protect specific routes.
     */
    public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;
        requestNamespace.set('actorType', ActorType.ANONYMOUS);
        requestNamespace.set('actorId', 'ANONYMOUS');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, jwtConfig.jwt.secret) as TokenPayload;

            // LLD Principle: Always fetch the latest user data from the database.
            // Do not trust the token's payload for anything other than the user's ID.
            // This prevents issues with outdated roles or permissions.
            const user = await prisma.account.findUnique({
                where: { id: decoded.sub },
                select: { id: true, role: { select: { name: true, rolePermissions: { select: { permission: { select: { key: true } } } } } } }
            });

            if (!user) {
                logger.warn('Authenticated user not found in database.', { ...getRequestContext(), userId: decoded.sub });
                return next(new HttpError(401, 'Invalid credentials.'));
            }

            const permissions = user.role?.rolePermissions.map((rp: { permission: { key: string } }) => rp.permission.key) || [];
            const roleName = user.role?.name || 'ANONYMOUS';

            // Attach the validated and up-to-date user information to the request
            req.user = {
                id: user.id,
                role: roleName,
                permissions: permissions,
            };

            // Set context for logging and monitoring
            requestNamespace.set('actorId', user.id);
            const actorType = ActorType[roleName as keyof typeof ActorType] || ActorType.USER;
            requestNamespace.set('actorType', actorType);

            logger.info('User authenticated successfully', {
                ...getRequestContext(),
                action: 'USER_AUTHENTICATION_SUCCESS',
            });

            next();
        } catch (error) {
            logger.warn('Authentication error: Invalid or expired token.', { ...getRequestContext(), error });
            // Pass an HttpError to the global error handler
            next(new HttpError(401, 'Invalid or expired token.'));
        }
    };

    /**
     * Route protection middleware.
     *
     * This middleware must be used AFTER the `authenticate` middleware.
     * It checks if `req.user` has been set, failing with a 401 error if not.
     * This is used to protect routes that require a logged-in user.
     */
    public requireAuth = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new HttpError(401, 'Unauthorized: Authentication is required.'));
        }
        next();
    };

    /**
     * Permission-based authorization middleware.
     *
     * This middleware must be used AFTER `authenticate` and `requireAuth`.
     * It checks if the authenticated user has the required permission(s).
     *
     * @param {string | string[]} requiredPermissions - A single permission or a list of permissions.
     */
    public authorize = (requiredPermissions: string | string[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                return next(new HttpError(401, 'Unauthorized: Authentication required.'));
            }

            const userPermissions = req.user.permissions || [];
            const permissionsArray = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];

            if (permissionsArray.length === 0) {
                return next();
            }

            const hasPermission = permissionsArray.some((perm) => userPermissions.includes(perm));

            if (!hasPermission) {
                return next(new HttpError(403, 'Forbidden: You do not have permission to access this resource.'));
            }
            
            next();
        };
    };
}

// Export a single instance of the middleware class
const authMiddleware = new AuthenticationMiddleware();
export const authenticate = authMiddleware.authenticate;
export const requireAuth = authMiddleware.requireAuth;
export const authorizePermission = authMiddleware.authorize;
