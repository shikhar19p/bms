// bms-monorepo/packages/backend-common/data-access/redis/interfaces/redis.interface.ts

import { SetOptions } from 'redis'; // Import SetOptions for the set method

/**
 * Interface for a Redis client wrapper.
 * This abstracts the underlying Redis library operations for specific commands.
 * We pick only the methods needed by our application logic and define their signatures
 * to ensure type compatibility with our implementation.
 */
export interface IRedisClient {
    /**
     * Get the value of a key.
     * @param key The key to retrieve.
     * @returns The value of the key, or null if the key does not exist.
     */
    get(key: string): Promise<string | null>;

    /**
     * Set the string value of a key.
     * @param key The key to set.
     * @param value The value to store.
     * @param options Optional: { EX: seconds } for expiration.
     * @returns 'OK' if the command was executed correctly, or null if NX or XX was given and the condition was not met.
     */
    set(key: string, value: string, options?: SetOptions): Promise<string | null>;

    /**
     * Deletes a key.
     * @param key The key to delete.
     * @returns The number of keys that were removed.
     */
    del(key: string): Promise<number>;

    /**
     * Set a key's time to live in seconds.
     * @param key The key to set expiration for.
     * @param seconds The time to live in seconds.
     * @returns 1 if the timeout was set, 0 otherwise.
     */
    expire(key: string, seconds: number): Promise<number>; // Changed return type to number

    /**
     * Increments the number stored at key by one.
     * @param key The key to increment.
     * @returns The value of key after the increment.
     */
    incr(key: string): Promise<number>;

    /**
     * Determine if a key exists.
     * @param key The key to check.
     * @returns 1 if the key exists, 0 if the key does not exist.
     */
    exists(key: string): Promise<number>;

    /**
     * Disconnects the Redis client.
     */
    disconnect(): Promise<void>;
}
