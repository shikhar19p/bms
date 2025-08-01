// bms-monorepo/apps/http-backend/src/services/auth-service/user/password-reset.service.ts

import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger } from '@workspace/backend-common/logger';
import { getRequestContext } from '@workspace/backend-common/middleware';
import { appConfig, jwtConfig } from '@workspace/backend-common/config';

// Interfaces for dependencies
import { ICredentialService, IPasswordResetService } from '../interfaces/auth.interfaces';

// Concrete services for injection (assuming these are singletons or instantiated elsewhere)



import { IRedisClient } from '@workspace/backend-common/data-access/redis';


// Constants for password reset token
const PASSWORD_RESET_TOKEN_PREFIX = 'password_reset:';
// Use a specific expiration for password reset tokens, not refresh token expiration
const PASSWORD_RESET_EXPIRATION_SECONDS = 3600; // 1 hour (adjust as needed)

export class PasswordResetService implements IPasswordResetService {
    constructor(
        private readonly logger: ILogger,
        private readonly credentialService: ICredentialService,
        private readonly passwordResetEmailSenderService: PasswordResetEmailSenderService,
        private readonly redisClient: IRedisClient
    ) {}

    /**
     * Initiates a password reset process.
     * Generates a unique, time-limited token and sends a password reset email to the user.
     * @param {string} email - The email address of the user requesting a password reset.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @throws {HttpError} If the email is not found or other issues prevent reset.
     */
    public async requestPasswordReset(
        email: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<void> {
        const context = {
            ...getRequestContext(), // Include common request context
            module: 'PasswordResetService',
            action: 'REQUEST_PASSWORD_RESET',
            identifier: email,
            ipAddress,
            userAgent,
            correlationId,
        };
        this.logger.info(`Password reset request initiated for email: ${email}.`, context);

        try {
            // 1. Find the user by email
            const user = await this.credentialService.findUserByIdentifier(email, true, false);

            if (!user) {
                // For security, do not reveal if the email exists or not.
                // Log the attempt but return a generic success message to the client.
                this.logger.warn(`Password reset request for non-existent email: ${email}.`, { ...context, status: 'NOT_FOUND' });
                // Still return success to prevent user enumeration
                return;
            }

            const userContext = { ...context, actorId: user.id, actorEmail: user.email };
            this.logger.info(`User found for password reset request: ${user.id}.`, userContext);

            // 2. Generate a unique, time-limited token
            const resetToken = crypto.randomUUID(); // Using Node.js crypto module for UUID
            const redisKey = `${PASSWORD_RESET_TOKEN_PREFIX}${resetToken}`;

            // 3. Store the token in Redis with the user ID and an expiration
            // Using set with EX option for atomic operation, matching RedisClient API
            await this.redisClient.set(redisKey, user.id, { EX: PASSWORD_RESET_EXPIRATION_SECONDS });
            this.logger.debug(`Password reset token stored in Redis for user ${user.id}. Key: ${redisKey}`, userContext);

            // 4. Construct the reset URL
            const resetUrl = `${appConfig.userWebUrl}/reset-password?token=${resetToken}`; // Use appConfig.userWebUrl

            // 5. Send the password reset email
            await this.passwordResetEmailSenderService.sendPasswordResetEmail(user.email, user.name || user.email, resetUrl);

            this.logger.success(`Password reset email sent to ${user.email} for user ${user.id}.`, { ...userContext, status: 'EMAIL_SENT' });
        } catch (error: any) {
            this.logger.error(`Failed to request password reset for email ${email}: ${error.message}`, { ...context, status: 'FAILED' }, error);
            throw new HttpError(500, 'Failed to initiate password reset. Please try again later.');
        }
    }

    /**
     * Resets the user's password using a valid reset token.
     * @param {string} token - The password reset token received by the user.
     * @param {string} newPassword - The new password for the user's account.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @throws {HttpError} If the token is invalid, expired, or other issues prevent password update.
     */
    public async resetPassword(
        token: string,
        newPassword: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<void> {
        const context = {
            ...getRequestContext(), // Include common request context
            module: 'PasswordResetService',
            action: 'RESET_PASSWORD',
            ipAddress,
            userAgent,
            correlationId,
            identifier: token.substring(0, 10) + '...', // Log part of the token for identification
        };
        this.logger.info(`Password reset attempt with token.`, context);

        try {
            // 1. Verify the token: Check if it exists in Redis and retrieve the associated userId
            const redisKey = `${PASSWORD_RESET_TOKEN_PREFIX}${token}`;
            const userId = await this.redisClient.get(redisKey);

            if (!userId) {
                this.logger.warn(`Password reset failed: Invalid or expired token provided.`, { ...context, status: 'INVALID_TOKEN' });
                throw new HttpError(400, 'Invalid or expired password reset token.');
            }

            const userContext = { ...context, actorId: userId, resourceId: userId };
            this.logger.info(`Token valid. User ID: ${userId}. Proceeding to reset password.`, userContext);

            // 2. Hash the new password
            const newHashedPassword = await this.credentialService.hashPassword(newPassword);

            // 3. Update the user's password in the database
            await this.credentialService.updatePassword(userId, newHashedPassword);
            this.logger.debug(`Password updated for user ${userId}.`, userContext);

            // 4. Invalidate the used token from Redis to prevent reuse
            await this.redisClient.del(redisKey);
            this.logger.debug(`Password reset token invalidated for user ${userId}.`, userContext);

            this.logger.success(`Password successfully reset for user ${userId}.`, { ...userContext, status: 'SUCCESS' });
        } catch (error: any) {
            this.logger.error(`Failed to reset password with token: ${error.message}`, { ...context, status: 'FAILED' }, error);
            // Re-throw HttpError directly, wrap others in generic HttpError
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(500, 'Failed to reset password. Please try again later.');
        }
    }

    /**
     * Generates a simple unique token (UUID).
     * In a real system, you might use a more cryptographically secure random string
     * or a signed token if you need to embed data without a separate lookup.
     */
    private generateUniqueToken(): string {
        // Using crypto.randomUUID for a robust unique ID
        // Ensure 'crypto' module is available in your Node.js environment
        return crypto.randomUUID();
    }
}

// Export the instantiated service
import { logger as globalLogger } from '@workspace/backend-common/logger';
import { credentialService } from './credential.service';

import { redisClient } from '@workspace/backend-common/data-access/redis';
import { PasswordResetEmailSenderService, passwordResetEmailSenderService } from "../../email-service/password-reset-email-sender.service";


export const passwordResetService = new PasswordResetService(
    globalLogger,
    credentialService,
    passwordResetEmailSenderService,
    redisClient
);
