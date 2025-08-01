import { IRateLimiter } from '../interfaces/i-rate-limiter';
import Redis from 'ioredis';

export class TokenBucketRateLimiter implements IRateLimiter {
  constructor(
    private redisClient: Redis,
    private bucketSize: number,     // max tokens
    private refillRate: number      // tokens per second
  ) {}

  async isAllowed(key: string): Promise<boolean> {
    const now = Date.now();
    const bucketKey = `ratelimit:${key}`;
    const tokenKey = `${bucketKey}:tokens`;
    const timestampKey = `${bucketKey}:timestamp`;

    const [tokensStr, lastTimestampStr] = await this.redisClient.mget(tokenKey, timestampKey);
    const tokens = parseFloat(tokensStr ?? this.bucketSize.toString());
    const lastTimestamp = parseInt(lastTimestampStr ?? now.toString());

    const elapsed = (now - lastTimestamp) / 1000;
    const refill = Math.floor(elapsed * this.refillRate);
    const newTokens = Math.min(tokens + refill, this.bucketSize);

    if (newTokens < 1) {
      return false; // not enough tokens
    }

    await this.redisClient
      .multi()
      .set(tokenKey, (newTokens - 1).toFixed(2))
      .set(timestampKey, now)
      .expire(bucketKey, 60) // Optional: expire if idle
      .exec();

    return true;
  }
}
