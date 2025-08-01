import { RedisRateLimiter } from '../strategies/redis-rate-limiter';
import { InMemoryRateLimiter } from '../strategies/in-memory-rate-limiter';
import { IRateLimiter } from '../interfaces/i-rate-limiter';
import Redis from 'ioredis';
import { rateLimiterConfig } from '@workspace/backend-common/config';

export const createRateLimiter = (
  windowInSeconds = rateLimiterConfig.defaultWindowInSeconds,
  maxRequests = rateLimiterConfig.defaultMaxRequests
): IRateLimiter => {
  if (rateLimiterConfig.defaultStrategy === 'redis' && rateLimiterConfig.redisUrl) {
    const redis = new Redis(rateLimiterConfig.redisUrl);
    return new RedisRateLimiter(redis, windowInSeconds, maxRequests);
  }

  return new InMemoryRateLimiter(windowInSeconds, maxRequests);
};
