// bms-monorepo/packages/backend-common/sms/twilio/twilio.sms.service.ts

import twilio from 'twilio';
import { ISmsService } from './interfaces/sms.interface';
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { config } from '@workspace/backend-common/config';
import { HttpError } from '@workspace/backend-common/http-error';

export class TwilioSmsService implements ISmsService {
    private twilioClient: twilio.Twilio;
    private readonly twilioPhoneNumber: string;
    private readonly logger: ILogger;

    constructor(loggerInstance: ILogger = globalLogger) {
        this.logger = loggerInstance;

        const { accountSid, authToken, phoneNumber } = config.twilio;

        if (!accountSid || !authToken || !phoneNumber) {
            const errorMsg = 'Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER) are not fully configured.';
            this.logger.error(errorMsg, { module: 'TwilioSmsService', action: 'INIT_FAILED', status: 'FAILED' });
            // In a production environment, you might want to throw an error here
            // or ensure a fallback SMS service is used.
            // For now, we'll proceed but log the warning.
            this.twilioClient = null as any; // Mark client as unusable
            this.twilioPhoneNumber = '';
            return;
        }

        this.twilioClient = twilio(accountSid, authToken);
        this.twilioPhoneNumber = phoneNumber;

        this.logger.info('Twilio SMS Service initialized.', { module: 'TwilioSmsService', action: 'INITIALIZED' });
    }

    /**
     * Sends an SMS message using Twilio.
     * @param toPhoneNumber The recipient's phone number (E.164 format, e.g., +1234567890).
     * @param message The text message to send.
     * @returns A Promise that resolves when the SMS is sent, or rejects on failure.
     * @throws {HttpError} If Twilio client is not initialized or SMS sending fails.
     */
    public async sendSms(toPhoneNumber: string, message: string): Promise<void> {
        const context: LogContext = {
            module: 'TwilioSmsService',
            action: 'SEND_SMS',
            resourceType: 'SMS',
            resourceId: toPhoneNumber,
            identifier: message.substring(0, 50) + '...', // Log snippet of message
        };

        if (!this.twilioClient) {
            this.logger.error('Twilio client not initialized. Cannot send SMS.', { ...context, status: 'FAILED' });
            throw new HttpError(500, 'SMS service not configured correctly.');
        }

        try {
            this.logger.info(`Attempting to send SMS to ${toPhoneNumber}.`, context);
            const smsResponse = await this.twilioClient.messages.create({
                body: message,
                to: toPhoneNumber,
                from: this.twilioPhoneNumber,
            });

            this.logger.success(`SMS sent successfully to ${toPhoneNumber}. SID: ${smsResponse.sid}`, {
                ...context,
                status: 'SUCCESS',
                // details: { smsSid: smsResponse.sid, smsStatus: smsResponse.status }
            });
        } catch (error: any) {
            this.logger.error(`Failed to send SMS to ${toPhoneNumber}: ${error.message}`, { ...context, status: 'FAILED' }, error);
            // Twilio errors can be complex, wrap them in HttpError
            throw new HttpError(500, `Failed to send SMS: ${error.message || 'Unknown Twilio error'}`);
        }
    }
}

// Export a singleton instance
export const twilioSmsService = new TwilioSmsService(globalLogger);