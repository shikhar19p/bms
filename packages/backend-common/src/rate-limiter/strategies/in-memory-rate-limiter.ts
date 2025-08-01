import { IRateLimiter } from '../interfaces/i-rate-limiter';

export class InMemoryRateLimiter implements IRateLimiter {
  private store = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private windowInSeconds: number,
    private maxRequests: number
  ) {}

  async isAllowed(key: string): Promise<boolean> {
    const now = Date.now();
    const data = this.store.get(key);

    if (!data || now > data.expiresAt) {
      this.store.set(key, { count: 1, expiresAt: now + this.windowInSeconds * 1000 });
      return true;
    }

    if (data.count < this.maxRequests) {
      data.count++;
      return true;
    }

    return false;
  }
}
