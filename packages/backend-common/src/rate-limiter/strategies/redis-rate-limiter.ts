import { IRateLimiter } from '../interfaces/i-rate-limiter';
import Redis from 'ioredis';

export class RedisRateLimiter implements IRateLimiter {
  constructor(
    private redisClient: Redis,
    private windowInSeconds: number,
    private maxRequests: number
  ) {}

  async isAllowed(key: string): Promise<boolean> {
    const windowKey = `${key}:${Math.floor(Date.now() / 1000 / this.windowInSeconds)}`;
    const count = await this.redisClient.incr(windowKey);
    if (count === 1) {
      await this.redisClient.expire(windowKey, this.windowInSeconds);
    }
    return count <= this.maxRequests;
  }
}
