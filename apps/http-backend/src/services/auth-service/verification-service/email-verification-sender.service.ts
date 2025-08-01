// apps/backend/src/services/auth-service/user/verification-service/email-verification-sender.service.ts


import { jwtConfig, config } from '@workspace/backend-common/config';
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';
import { baseEmailService, BaseEmailService, getEmailVerificationTemplate } from '../../email-service';

export class EmailVerificationSenderService {
    constructor(
        private readonly emailService: BaseEmailService,
        private readonly logger: ILogger = globalLogger
    ) {}

    /**
     * Sends an email verification link to the user.
     * @param {string} to - Recipient email address.
     * @param {string} verificationToken - The email verification token.
     * @returns {Promise<void>}
     * @throws {HttpError} If email sending fails.
     */
    public async sendEmailVerificationLink(to: string, verificationToken: string): Promise<void> {
        const verificationLink = `${config.userWebUrl}/auth/verify-email?token=${verificationToken}`;
        const expiresInMinutes = jwtConfig.jwt.emailVerificationTokenExpirationSeconds / 60; // Convert seconds to minutes for template

        const { subject, html, text } = getEmailVerificationTemplate({
            verificationLink,
            expiresInMinutes,
        });

        const context: LogContext = {
            module: 'EmailVerificationSenderService',
            action: 'SEND_VERIFICATION_EMAIL_LINK',
            resourceType: 'User',
            resourceId: to, // Using recipient email as resourceId
        };

        try {
            this.logger.info(`Attempting to send email verification link to ${to}`, context, { emailSubject: subject });

            await this.emailService.sendEmail({ to, subject, html, text });

            this.logger.success(`Email verification link sent successfully to ${to}`, {
                ...context,
                status: 'SUCCESS',
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email verification link to ${to}`, {
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
            throw new HttpError(500, `Failed to send verification email: ${error.message || 'Unknown error'}`);
        }
    }
}

// Export an instance for use by controllers or other services
export const emailVerificationSenderService = new EmailVerificationSenderService(baseEmailService, globalLogger);