// bms-monorepo/packages/backend-common/data-access/redis/redis.client.ts

import { createClient, RedisClientType, SetOptions } from 'redis'; // Import SetOptions
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { appConfig } from '@workspace/backend-common/config';
import { IRedisClient } from './interfaces/redis.interface';

/**
 * Concrete implementation of IRedisClient using the 'redis' package.
 * This class manages the connection to Redis and provides methods
 * for common Redis operations.
 */
export class RedisClient implements IRedisClient {
    private client: RedisClientType;
    private isConnected: boolean = false;
    private logger: ILogger;

    constructor(loggerInstance: ILogger = globalLogger) {
        this.logger = loggerInstance;

        // Construct Redis URL from appConfig
        const redisHost = appConfig.redis.host || 'localhost';
        const redisPort = appConfig.redis.port || 6379;
        const redisPassword = appConfig.redis.password;

        let redisUrl = `redis://${redisHost}:${redisPort}`;
        if (redisPassword) {
            // Include password in the URL if it exists
            redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
        }

        // Initialize Redis client with configuration from app.config.ts
        this.client = createClient({
            url: redisUrl, // Use 'url' property for host, port, and optional password
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            this.logger.info('Redis client connected.', { module: 'RedisClient', action: 'CONNECT', status: 'SUCCESS' });
        });

        this.client.on('error', (err) => {
            this.isConnected = false;
            this.logger.error('Redis client error:', { module: 'RedisClient', action: 'ERROR', status: 'FAILED' }, err);
        });

        this.client.on('end', () => {
            this.isConnected = false;
            this.logger.warn('Redis client connection ended.', { module: 'RedisClient', action: 'END' });
        });

        // Connect to Redis when the instance is created
        this.connect();
    }

    /**
     * Establishes the connection to the Redis server.
     * This is called automatically in the constructor, but can be called manually if needed.
     */
    private async connect(): Promise<void> {
        // client.isReady indicates if the client is connected and authenticated
        if (!this.client.isReady) {
            try {
                await this.client.connect();
                this.logger.info('Successfully established initial Redis connection.', { module: 'RedisClient', action: 'INITIAL_CONNECT', status: 'SUCCESS' });
            } catch (error: any) {
                this.logger.error('Failed to establish initial Redis connection.', { module: 'RedisClient', action: 'INITIAL_CONNECT', status: 'FAILED' }, error);
                // Depending on your application's tolerance for Redis downtime, you might want to
                // implement a retry mechanism here or throw a critical error.
            }
        }
    }

    /**
     * Ensures the client is connected before performing an operation.
     * Throws an error if not connected.
     */
    private ensureConnected(): void {
        if (!this.client.isReady) { // Use client.isReady as the definitive connection status
            const errorMessage = 'Redis client is not connected or ready.';
            this.logger.error(errorMessage, { module: 'RedisClient', action: 'OPERATION_FAILED', status: 'FAILED' });
            throw new Error(errorMessage);
        }
    }

    // --- IRedisClient methods implementation ---

    public async get(key: string): Promise<string | null> {
        this.ensureConnected();
        try {
            return await this.client.get(key);
        } catch (error: any) {
            this.logger.error(`Failed to get key '${key}' from Redis.`, { module: 'RedisClient', action: 'GET_FAILED' }, error);
            throw error;
        }
    }

    /**
     * Sets a key-value pair in Redis with an optional expiration time.
     * @param key The key to set.
     * @param value The value to store.
     * @param options Optional: { EX: seconds } for expiration.
     */
    public async set(key: string, value: string, options?: SetOptions): Promise<string | null> {
        this.ensureConnected();
        try {
            // The 'set' method directly accepts SetOptions as its third argument
            return await this.client.set(key, value, options);
        } catch (error: any) {
            this.logger.error(`Failed to set key '${key}' in Redis.`, { module: 'RedisClient', action: 'SET_FAILED' }, error);
            throw error;
        }
    }

    public async del(key: string): Promise<number> {
        this.ensureConnected();
        try {
            return await this.client.del(key);
        } catch (error: any) {
            this.logger.error(`Failed to delete key '${key}' from Redis.`, { module: 'RedisClient', action: 'DEL_FAILED' }, error);
            throw error;
        }
    }

    // Corrected return type to Promise<number> as Redis expire command returns 0 or 1
    public async expire(key: string, seconds: number): Promise<number> {
        this.ensureConnected();
        try {
            // The client.expire method returns a number (0 or 1)
            return await this.client.expire(key, seconds);
        } catch (error: any) {
            this.logger.error(`Failed to set expiration for key '${key}' in Redis.`, { module: 'RedisClient', action: 'EXPIRE_FAILED' }, error);
            throw error;
        }
    }

    public async incr(key: string): Promise<number> {
        this.ensureConnected();
        try {
            return await this.client.incr(key);
        } catch (error: any) {
            this.logger.error(`Failed to increment key '${key}' in Redis.`, { module: 'RedisClient', action: 'INCR_FAILED' }, error);
            throw error;
        }
    }

    public async exists(key: string): Promise<number> {
        this.ensureConnected();
        try {
            return await this.client.exists(key);
        } catch (error: any) {
            this.logger.error(`Failed to check existence of key '${key}' in Redis.`, { module: 'RedisClient', action: 'EXISTS_FAILED' }, error);
            throw error;
        }
    }

    /**
     * Disconnects the Redis client. Call this on application shutdown.
     */
    public async disconnect(): Promise<void> {
        // Check if client is ready (connected) before attempting to quit
        if (this.client.isReady) {
            try {
                await this.client.quit(); // Use quit() for graceful shutdown
                this.isConnected = false; // Update internal state
                this.logger.info('Redis client disconnected.', { module: 'RedisClient', action: 'DISCONNECT', status: 'SUCCESS' });
            } catch (error: any) {
                this.logger.error('Error disconnecting Redis client.', { module: 'RedisClient', action: 'DISCONNECT_FAILED' }, error);
            }
        } else {
            this.logger.warn('Attempted to disconnect Redis client, but it was not connected.', { module: 'RedisClient', action: 'DISCONNECT_SKIPPED' });
        }
    }
}

// Export a singleton instance of RedisClient for easy injection throughout the application
// This ensures only one connection pool is managed.
export const redisClient = new RedisClient(globalLogger);
