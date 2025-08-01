// packages/backend-common/src/config/rate-limiter-config.ts

export const rateLimiterConfig = {
  defaultStrategy: process.env.RATE_LIMITER_STRATEGY || 'in-memory',
  defaultWindowInSeconds: parseInt(process.env.RATE_LIMITER_WINDOW_IN_SECONDS || '60'),
  defaultMaxRequests: parseInt(process.env.RATE_LIMITER_MAX_REQUESTS || '100'),
  defaultBucketSize: parseInt(process.env.RATE_LIMITER_BUCKET_SIZE || '100'),
  defaultRefillRate: parseInt(process.env.RATE_LIMITER_REFILL_RATE || '10'),
  redisUrl: process.env.REDIS_URL,
  whitelistedIps: (process.env.RATE_LIMITER_WHITELISTED_IPS || '').split(','),
  whitelistedUserIds: (process.env.RATE_LIMITER_WHITELISTED_USER_IDS || '').split(','),
};