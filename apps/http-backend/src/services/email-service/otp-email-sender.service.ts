// bms-monorepo/apps/http-backend/src/services/email-service/otp-email-sender.service.ts

import { BaseEmailService, baseEmailService } from './base-email.service'; // <-- Import the instance here
import { getOtpEmailTemplate } from './utils/email-templates';
import { jwtConfig } from '@workspace/backend-common/config';
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';

export class OtpEmailSenderService {
    constructor(
        private readonly emailService: BaseEmailService,
        private readonly logger: ILogger = globalLogger
    ) {}

    /**
     * Sends an OTP (One-Time Password) via email.
     * @param {string} to - Recipient email address.
     * @param {string} otp - The OTP to send.
     * @returns {Promise<void>}
     * @throws {HttpError} If email sending fails.
     */
    public async sendOtpEmail(to: string, otp: string): Promise<void> {
        const expiresInMinutes = jwtConfig.jwt.mfa.expirationSeconds; // Assuming MFA token expiry is for OTP

        const { subject, html, text } = getOtpEmailTemplate({
            otp,
            expiresInMinutes,
        });

        const context: LogContext = {
            module: 'OtpEmailSenderService',
            action: 'SEND_OTP_EMAIL',
            resourceType: 'User',
            resourceId: to, // Using recipient email as resourceId
        };

        try {
            this.logger.info(`Attempting to send OTP email to ${to}`, context, { emailSubject: subject });

            await this.emailService.sendEmail({ to, subject, html, text });

            this.logger.success(`OTP email sent successfully to ${to}`, {
                ...context,
                status: 'SUCCESS',
            });
        } catch (error: any) {
            this.logger.error(`Failed to send OTP email to ${to}`, {
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
            throw new HttpError(500, `Failed to send OTP email: ${error.message || 'Unknown error'}`);
        }
    }
}

// Export a singleton instance, now with baseEmailService correctly imported
export const otpEmailSenderService = new OtpEmailSenderService(baseEmailService, globalLogger);