// bms-monorepo/apps/http-backend/src/services/email-service/password-reset-email-sender.service.ts

import { BaseEmailService, baseEmailService } from './base-email.service';

import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';
import { getPasswordResetEmailTemplate } from './utils/email-templates';

export class PasswordResetEmailSenderService {
    constructor(
        private readonly emailService: BaseEmailService,
        private readonly logger: ILogger = globalLogger
    ) {}

    /**
     * Sends a password reset email to the user.
     * @param {string} to - Recipient email address.
     * @param {string} userName - The name of the user (for personalization).
     * @param {string} resetUrl - The URL the user needs to click to reset their password.
     * @returns {Promise<void>}
     * @throws {HttpError} If email sending fails.
     */
    public async sendPasswordResetEmail(to: string, userName: string, resetUrl: string): Promise<void> {
        // The expiration for the link is handled by the token in Redis,
        // but you might want to display it in the email (e.g., "link expires in 1 hour").
        // For simplicity, we'll assume the template handles this or it's a fixed duration.
        const expiresInMinutes = 60; // Example: Link expires in 60 minutes (matches PASSWORD_RESET_EXPIRATION_SECONDS)

           const { subject, html, text } = getPasswordResetEmailTemplate({
            userName, // This property is now correctly passed
            resetUrl,
            expiresInMinutes,
        });

        const context: LogContext = {
            module: 'PasswordResetEmailSenderService',
            action: 'SEND_PASSWORD_RESET_EMAIL',
            resourceType: 'User',
            resourceId: to, // Using recipient email as resourceId
            recipient: to, // Explicitly log recipient
        };

        try {
            this.logger.info(`Attempting to send password reset email to ${to}`, context, { emailSubject: subject });

            await this.emailService.sendEmail({ to, subject, html, text });

            this.logger.success(`Password reset email sent successfully to ${to}`, {
                ...context,
                status: 'SUCCESS',
            });
        } catch (error: any) {
            this.logger.error(`Failed to send password reset email to ${to}`, {
                ...context,
                status: 'FAILED',
            }, {
                emailSubject: subject,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
            });
            throw new HttpError(500, `Failed to send password reset email: ${error.message || 'Unknown error'}`);
        }
    }
}

// Export a singleton instance, now with baseEmailService correctly imported
export const passwordResetEmailSenderService = new PasswordResetEmailSenderService(baseEmailService, globalLogger);
