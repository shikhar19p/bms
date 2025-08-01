export interface IRateLimiter {
  isAllowed(key: string): Promise<boolean>;
}
