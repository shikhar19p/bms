import { createRateLimiter } from '@backend-common/rate-limiter/factory/rate-limiter-factory';
import { isWhitelisted } from '@backend-common/rate-limiter/utils/whitelist-check';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

interface RateLimiterOptions {
  windowInSeconds?: number;
  maxRequests?: number;
  keyResolver?: (req: AuthenticatedRequest) => string;
}

export const rateLimiterMiddleware = (
  options: RateLimiterOptions = {}
): RequestHandler => {
  const limiter = createRateLimiter(
    options.windowInSeconds,
    options.maxRequests
  );

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (isWhitelisted(req)) {
        next();
        return;
      }

      const key = options.keyResolver
        ? options.keyResolver(req)
        : req.user?.id
        ? `uid:${req.user.id}`
        : `ip:${req.ip}`;

      const allowed = await limiter.isAllowed(key);

      if (!allowed) {
        res.status(429).json({ message: 'Too many requests. Please try again later.' });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      res.status(500).json({ message: 'Internal server error from rate limiter.' });
    }
  };
};
