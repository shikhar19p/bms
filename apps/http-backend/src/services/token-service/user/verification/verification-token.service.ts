// bms-monorepo/apps/backend/src/services/token-service/verification/verification-token.service.ts

import { BaseTokenService } from '../base-token.service'; // Still relative for internal service structure
import { jwtConfig } from '@workspace/backend-common/config';
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error'; // Important to import HttpError for potential re-throwing

// Import from common package
import { TokenType } from '@workspace/common/enums';
import { VerificationTokenPayload } from '@workspace/common/interfaces'; // Using the specific payload interface

export class VerificationTokenService extends BaseTokenService {
    constructor(loggerInstance: ILogger = globalLogger) {
        super(loggerInstance); // Pass the logger to the base class
    }

    /**
     * Generates an email verification token.
     * @param {string} accountId - The ID of the account to verify.
     * @param {string} roleId - The role ID of the account.
     * @param {string} email - The email address to verify.
     * @returns {Promise<string>} The generated email verification token.
     */
    public async generateEmailVerificationToken(
        accountId: string,
        roleId: string,
        email: string
    ): Promise<string> {
        const context: LogContext = {
            module: 'VerificationTokenService',
            action: 'GENERATE_EMAIL_VERIFICATION_TOKEN',
            resourceType: 'User',
            resourceId: accountId,
            actorId: accountId,
            actorType: 'SYSTEM' // Or 'USER_REGISTRATION' if triggered by user
        };

        try {
            // Use the consistent naming from jwtConfig
            const expiresInSeconds = jwtConfig.jwt.emailVerificationTokenExpirationSeconds;
            
            // Use the specific VerificationTokenPayload interface for stronger type checking
            const payload: VerificationTokenPayload = {
                userId: accountId,
                roleId,
                type: TokenType.EMAIL_VERIFICATION, // Ensure this matches the enum in common
                identifier: email, // Store the email as an identifier in the token
            };

            const token = await this._generateAndSaveToken( // This uses the base class's logger
                payload,
                expiresInSeconds
            );

            this.logger.success(`Email verification token generated successfully for ${email} (user ID: ${accountId}).`, { ...context, status: 'SUCCESS' });
            return token;
        } catch (error: any) {
            this.logger.error(`Failed to generate email verification token for ${email} (user ID: ${accountId}).`, { ...context, status: 'FAILED' }, {
                error: { name: error.name, message: error.message, stack: error.stack }
            });
            throw error; // Re-throw the HttpError from _generateAndSaveToken
        }
    }

    /**
     * Verifies an email verification token.
     * @param {string} tokenString - The token string to verify.
     * @param {string} expectedEmail - The email address that the token should belong to.
     * @returns {Promise<any>} The token document from the database if valid.
     * @throws {HttpError} If the token is invalid, expired, blacklisted, or email mismatch.
     */
    public async verifyEmailVerificationToken(tokenString: string, expectedEmail: string): Promise<any> {
        const context: LogContext = {
            module: 'VerificationTokenService',
            action: 'VERIFY_EMAIL_VERIFICATION_TOKEN',
            resourceType: TokenType.EMAIL_VERIFICATION,
        };

        // Leverage the base verifyToken method for common checks
        const tokenDoc = await this.verifyToken(tokenString, TokenType.EMAIL_VERIFICATION);

        // Additional specific check for verification tokens: identifier mismatch
        if (tokenDoc.identifier !== expectedEmail) {
            this.logger.warn(`Email verification token identifier mismatch. Expected ${expectedEmail}, got ${tokenDoc.identifier}.`, {
                ...context, status: 'FAILED', resourceId: tokenDoc.accountId, actorId: tokenDoc.accountId
            });
            throw new HttpError(401, 'Invalid email verification token for this email address.');
        }
        
        // After successful verification, you might want to invalidate the token
        // This depends on whether you want verification tokens to be single-use.
        // For email verification, it's often single-use.
        await this.revokeToken(tokenString, TokenType.EMAIL_VERIFICATION, tokenDoc.accountId);
        this.logger.info(`Email verification token successfully verified and blacklisted for user ${tokenDoc.accountId} (${tokenDoc.identifier}).`, {
            ...context, status: 'SUCCESS', resourceId: tokenDoc.accountId, actorId: tokenDoc.accountId
        });

        return tokenDoc;
    }
}

// Export an instance for easy use (initialized with the global logger)
// This is common for singleton services that don't require different configurations per instance.
export const verificationTokenService = new VerificationTokenService(globalLogger);