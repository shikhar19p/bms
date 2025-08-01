// apps/backend/src/services/auth-service/user/verification-service/email-verification.service.ts

import { HttpError } from "@workspace/backend-common/http-error";
import { prismaClient } from "@workspace/db/client"; // Your Prisma client

import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { emailVerificationSenderService, EmailVerificationSenderService } from './email-verification-sender.service'; // Import the new sender service
import { verificationTokenService, VerificationTokenService } from "../../token-service/user";


export class EmailVerificationService {
    // Inject specific token services and the email sender service
    constructor(
        private readonly verificationTokenService: VerificationTokenService, // Use specific token service
        private readonly emailVerificationSenderService: EmailVerificationSenderService, // Inject email sender
        private readonly logger: ILogger = globalLogger
    ) {}

    /**
     * Verifies a user's email address using a provided email verification token.
     * This method is part of the post-registration email verification flow.
     *
     * @param {string} token - The email verification token received from the user's email link.
     * @param {string} userEmail - The email of the user attempting to verify (for an extra layer of security/logging).
     * @param {string} ipAddress - IP address of the request.
     * @param {string} userAgent - User agent of the request.
     * @param {string} correlationId - Unique ID for the request trace.
     * @returns {Promise<any>} The updated user object after successful verification.
     * @throws {HttpError} Throws an error if the token is invalid, expired, already used, or user not found.
     */
    public async verifyEmail(token: string, userEmail: string, ipAddress: string, userAgent: string, correlationId: string): Promise<any> {
        const context: LogContext = {
            module: 'EmailVerificationService', // Corrected module name for this service
            action: 'VERIFY_EMAIL_TOKEN',
            ipAddress: ipAddress,
            userAgent: userAgent,
            correlationId: correlationId,
            resourceType: 'ACCOUNT', // The resource being acted upon
            resourceId: userEmail, // Initial resource ID for context
            actorType: 'USER', // The user who is triggering the action
            actorEmail: userEmail, // For more specific logging
        };
        let tokenDoc: any; // Type should be more specific from prisma client

        try {
            // Phase 1: Token Validation using the specific token service
            tokenDoc = await this.verificationTokenService.verifyEmailVerificationToken(token, userEmail);

            // Once token is valid, populate context with user ID from token
            context.actorId = tokenDoc.accountId;
            context.resourceId = tokenDoc.accountId; // Update resourceId to accountId

            this.logger.info(`Email verification token validated successfully for user ID: ${tokenDoc.accountId}.`, { ...context, eventType: 'TokenValidated' });

        } catch (error: any) {
            this.logger.warn(`Email verification token failed validation.`, { ...context, status: 'FAILED', action: 'EMAIL_VERIFICATION_FAILED_TOKEN_INVALID' }, { error: error.message, tokenSnippet: token.substring(0, 10) + '...' });
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(401, 'Invalid or expired email verification token.');
        }

        try {
            // Phase 2: User Retrieval and Status Check
            const user = await prismaClient.account.findUnique({
                where: { id: tokenDoc.accountId },
                include: { role: true }, // Include role for a complete user object
            });

            if (!user) {
                this.logger.error(`User not found in DB for email verification token (ID: ${tokenDoc.accountId}).`, {
                    ...context,
                    action: 'EMAIL_VERIFICATION_FAILED_USER_NOT_FOUND',
                    status: 'FAILED'
                }, {
                    error: { tokenAccountId: tokenDoc.accountId, token: token.substring(0, 50) + '...' }
                });
                throw new HttpError(404, 'User not found for this verification token.');
            }

            // Also check if the email on the account matches the identifier in the token, for robustness
            if (user.email !== tokenDoc.identifier) {
                 this.logger.error(`Token identifier mismatch with user's email: Token ID: ${tokenDoc.identifier}, User ID: ${user.email}.`, {
                    ...context,
                    action: 'EMAIL_VERIFICATION_FAILED_EMAIL_MISMATCH',
                    status: 'FAILED'
                });
                throw new HttpError(400, 'Verification token does not match user account.');
            }

            if (user.isEmailVerified) {
                this.logger.info(`Email '${user.email}' (ID: ${user.id}) is already verified.`, {
                    ...context,
                    action: 'EMAIL_ALREADY_VERIFIED_ATTEMPT',
                    status: 'ALREADY_VERIFIED',
                }, {
                    details: { token: token.substring(0, 50) + '...' }
                });
                // No need to revoke token here, as verifyEmailVerificationToken already revokes it.
                return user;
            }

            const oldValue = { isEmailVerified: user.isEmailVerified };
            // Phase 3: Update User Status
            const updatedUser = await prismaClient.account.update({
                where: { id: user.id },
                data: { isEmailVerified: true, updatedAt: new Date() },
                include: { role: true }, // Re-include role for the returned object
            });

            this.logger.success(`Email '${user.email}' (ID: ${user.id}) successfully verified.`, {
                ...context,
                status: 'SUCCESS',
                newValue: { isEmailVerified: true },
                oldValue: oldValue
            });
            
            // Phase 4: Token Revocation - Already handled by verificationTokenService.verifyEmailVerificationToken,
            // so no explicit call needed here unless you want to log it again.
            // this.logger.info(`Email verification token revoked for user ${user.id} after successful verification.`, { ...context, eventType: 'TokenRevoked' });

            return updatedUser;
        } catch (error: any) {
            this.logger.error(`Failed to complete email verification for user ID: ${tokenDoc?.accountId || userEmail}.`, {
                ...context,
                action: 'EMAIL_VERIFICATION_FAILED_PROCESSING',
                status: 'ERROR',
            }, {
                error: { name: error.name, message: error.message, stack: error.stack, httpStatus: error instanceof HttpError ? error.statusCode : 500 }
            });
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, 'Failed to complete email verification due to an unexpected error. Please try again.');
        }
    }

    /**
     * Resends an email verification link to a user.
     * This method would be called if a user requests a new verification email.
     * @param {string} accountId - The ID of the user's account.
     * @param {string} email - The user's email address.
     * @param {string} roleId - The user's role ID.
     * @returns {Promise<void>}
     */
    public async resendEmailVerification(accountId: string, email: string, roleId: string): Promise<void> {
        const context: LogContext = {
            module: 'EmailVerificationService',
            action: 'RESEND_EMAIL_VERIFICATION_LINK',
            resourceType: 'User',
            resourceId: accountId,
            actorType: 'USER',
            actorId: accountId,
            actorEmail: email,
        };

        try {
            const user = await prismaClient.account.findUnique({ where: { id: accountId } });
            if (!user) {
                throw new HttpError(404, 'User not found.');
            }
            if (user.isEmailVerified) {
                this.logger.info(`Attempt to resend verification email for already verified user ${email}.`, { ...context, status: 'ALREADY_VERIFIED' });
                return; // Or throw a specific error if you want to explicitly prevent this.
            }

            // Generate a new verification token
            const newToken = await this.verificationTokenService.generateEmailVerificationToken(accountId, roleId, email);

            // Send the new email using the injected sender service
            await this.emailVerificationSenderService.sendEmailVerificationLink(email, newToken);

            this.logger.success(`Successfully resent email verification link to ${email}.`, { ...context, status: 'SUCCESS' });
        } catch (error: any) {
            this.logger.error(`Failed to resend email verification link to ${email}.`, { ...context, status: 'FAILED' }, {
                error: { name: error.name, message: error.message, stack: error.stack }
            });
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, 'Failed to resend verification email.');
        }
    }
}

// Export an instance for easy use (initialized with injected dependencies)
export const emailVerificationService = new EmailVerificationService(
    verificationTokenService, // Use the exported instance from token-service
    emailVerificationSenderService, // Use the exported instance from the sender service
    globalLogger
);