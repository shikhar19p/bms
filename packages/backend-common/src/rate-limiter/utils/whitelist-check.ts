import { rateLimiterConfig } from '@workspace/backend-common/config';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: { id: string };
}

export const isWhitelisted = (req: RequestWithUser): boolean => {
  const ip = req.ip;
  const userId = req.user?.id;

  return !!(
    (ip && rateLimiterConfig.whitelistedIps.includes(ip)) ||
    (userId && rateLimiterConfig.whitelistedUserIds.includes(userId))
  );
};
