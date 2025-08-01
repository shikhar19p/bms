// apps/backend/src/services/email-service/base-email.service.ts

import nodemailer from 'nodemailer';
import { config } from '@workspace/backend-common/config'; // Import the main config
import { HttpError } from '@workspace/backend-common/http-error';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ILogger, LogContext, logger as globalLogger, NodemailerLoggerAdapter } from '@workspace/backend-common/logger'; // Import NodemailerLoggerAdapter
import { SendEmailOptions } from './auth/user/interfaces/email.interface';

export class BaseEmailService {
    protected transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    protected logger: ILogger;
    protected defaultFromEmail: string;

    constructor(loggerInstance: ILogger = globalLogger) {
        this.logger = loggerInstance;
        this.defaultFromEmail = config.email.from;

        const nodemailerLoggerAdapter = new NodemailerLoggerAdapter(this.logger);
        const nodemailerLogger = nodemailerLoggerAdapter.getLogger({ service: config.log.serviceName });

        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465, // Use 'true' if port is 465 (SSL/TLS), 'false' for other ports like 587 (STARTTLS)
            auth: {
                user: config.email.user,
                pass: config.email.password,
            },
            logger: nodemailerLogger,
            debug: config.env === 'development',
        } as SMTPTransport.Options);

        // Verify connection configuration (optional, but good for startup check)
        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error('Nodemailer transporter verification failed.', { module: 'EmailService', action: 'TRANSPORTER_INIT_FAILED', status: 'FAILED' }, { error: error.message });
            } else {
                this.logger.info('Nodemailer transporter ready for sending emails.', { module: 'EmailService', action: 'TRANSPORTER_INIT_SUCCESS', status: 'SUCCESS' });
            }
        });
    }

    /**
     * Sends a generic email.
     * @param {SendEmailOptions} options - Email sending options.
     * @returns {Promise<void>}
     * @throws {HttpError} If email sending fails.
     */
    public async sendEmail(options: SendEmailOptions): Promise<void> {
        const { to, subject, html, text, from = this.defaultFromEmail } = options;

        const baseContext: LogContext = {
            module: 'EmailService',
            action: 'SEND_GENERIC_EMAIL',
            resourceType: 'Email',
            resourceId: to, // Using recipient email as resourceId
        };

        try {
            this.logger.info(`Attempting to send generic email to ${to} with subject: "${subject}"`,
                baseContext,
                { emailSubject: subject }
            );

            await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
                text,
            });

            this.logger.success(`Generic email sent successfully to ${to} with subject: "${subject}"`,
                { ...baseContext, status: 'SUCCESS' },
                { emailSubject: subject }
            );
        } catch (error: any) {
            this.logger.error(`Failed to send generic email to ${to} for subject "${subject}"`,
                { ...baseContext, status: 'FAILED' },
                {
                    emailSubject: subject,
                    error: {
                        message: error.message,
                        stack: error.stack,
                        name: error.name,
                    },
                }
            );
            throw new HttpError(500, `Failed to send email to ${to}: ${error.message || 'Unknown error'}`);
        }
    }
}

// Export an instance for direct use where a generic email service is needed
export const baseEmailService = new BaseEmailService(globalLogger);