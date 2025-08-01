// bms-monorepo/apps/http-backend/src/services/auth-service/user/otp.service.ts

import { redisClient, IRedisClient } from '@workspace/backend-common/data-access/redis'; // Import the concrete Redis client instance
import { ILogger, LogContext } from '@workspace/backend-common/logger';


import { HttpError } from '@workspace/backend-common/http-error';
import jwt from 'jsonwebtoken'; // For MFA token generation
import { jwtConfig } from '@workspace/backend-common/config'; // For MFA token secret and expiry

// Import the concrete Twilio SMS service and its interface
 // <-- Add 'sms' to import path

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes (consistent with jwtConfig.jwt.mfa.expirationSeconds)

export class OtpService implements IOtpService {
    constructor(
        private readonly logger: ILogger,
        private readonly redis: IRedisClient,
        private readonly smsService: ISmsService // Injected SMS service (TwilioSmsService instance)
    ) {}

    /**
     * Generates a short-lived JWT token (MFA token) to track the MFA session.
     * This token does NOT grant access to the application, only indicates that
     * the user has successfully passed the first authentication step (e.g., password).
     * @param {string} userId - The ID of the user for whom the MFA token is generated.
     * @returns {string} The generated MFA JWT token.
     */
    public generateMfaToken(userId: string): string {
        const context: LogContext = {
            module: 'OtpService',
            action: 'GENERATE_MFA_TOKEN',
            resourceType: 'User',
            resourceId: userId,
            actorType: 'SYSTEM'
        };
        try {
            const payload = { userId };
            const mfaToken = jwt.sign(payload, jwtConfig.jwt.mfa.secret, {
                expiresIn: jwtConfig.jwt.mfa.expirationSeconds,
            });
            this.logger.info(`MFA token generated for user ${userId}.`, { ...context, status: 'SUCCESS' });
            return mfaToken;
        } catch (error: any) {
            this.logger.error(`Failed to generate MFA token for user ${userId}.`, { ...context, status: 'FAILED' }, error);
            throw new HttpError(500, 'Failed to generate MFA token.');
        }
    }

    /**
     * Generates a random 6-digit OTP and stores it in Redis with a TTL.
     * @param {string} userId - The ID of the user for whom the OTP is generated.
     * @returns {Promise<string>} The generated OTP.
     * @throws {HttpError} If Redis operation fails.
     */
    public async generateAndStoreOtp(userId: string): Promise<string> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const key = `otp:${userId}`; // Unique key for user's OTP

        const context: LogContext = {
            module: 'OtpService',
            action: 'GENERATE_AND_STORE_OTP',
            resourceType: 'OTP',
            resourceId: userId,
            actorType: 'SYSTEM'
        };

        try {
            // Store OTP in Redis with an expiration
            await this.redis.set(key, otp, { EX: OTP_EXPIRY_SECONDS });
            this.logger.info(`OTP generated and stored for user ${userId}.`, { ...context, status: 'SUCCESS' });
            return otp;
        } catch (error: any) {
            this.logger.error(`Failed to generate and store OTP for user ${userId}.`, { ...context, status: 'FAILED' }, error);
            throw new HttpError(500, 'Failed to generate OTP. Please try again.');
        }
    }

    /**
     * Sends the OTP to the user's phone number via SMS using the injected SMS service.
     * @param {string} userId - The ID of the user.
     * @param {string} phoneNumber - The recipient phone number (E.164 format).
     * @param {string} otp - The OTP to send.
     * @returns {Promise<void>}
     * @throws {HttpError} If SMS sending fails.
     */
    public async sendOtpSms(userId: string, phoneNumber: string, otp: string): Promise<void> {
        const context: LogContext = {
            module: 'OtpService',
            action: 'SEND_OTP_SMS',
            resourceType: 'User',
            resourceId: userId,
            actorType: 'SYSTEM',
            identifier: phoneNumber // Log the phone number
        };
        try {
            // Use the injected SMS service (TwilioSmsService) to send the OTP
            await this.smsService.sendSms(phoneNumber, `Your Book My Sportz OTP is: ${otp}. It expires in ${OTP_EXPIRY_SECONDS / 60} minutes.`);
            this.logger.success(`OTP SMS sent to ${phoneNumber} for user ${userId}.`, { ...context, status: 'SUCCESS' });
        } catch (error: any) {
            this.logger.error(`Failed to send OTP SMS to ${phoneNumber} for user ${userId}: ${error.message}`, { ...context, status: 'FAILED' }, error);
            throw new HttpError(500, 'Failed to send OTP SMS. Please try again.');
        }
    }

    /**
     * Verifies the provided OTP against the stored OTP for a user.
     * Invalidates the OTP after successful verification to ensure single-use.
     * @param {string} userId - The ID of the user.
     * @param {string} otp - The OTP provided by the user.
     * @returns {Promise<boolean>} True if OTP is valid, false otherwise.
     * @throws {HttpError} If Redis operation fails.
     */
    public async verifyOtp(userId: string, otp: string): Promise<boolean> {
        const key = `otp:${userId}`;
        const context: LogContext = {
            module: 'OtpService',
            action: 'VERIFY_OTP',
            resourceType: 'OTP',
            resourceId: userId,
            actorType: 'USER', // User is attempting verification
            identifier: otp.substring(0, 2) + '...' // Log snippet of OTP for security
        };

        try {
            const storedOtp = await this.redis.get(key);

            if (storedOtp === otp) {
                await this.redis.del(key); // Invalidate OTP after successful verification (single-use)
                this.logger.success(`OTP verified successfully for user ${userId}.`, { ...context, status: 'SUCCESS' });
                return true;
            }

            this.logger.warn(`Invalid OTP provided for user ${userId}.`, { ...context, status: 'FAILED' });
            return false;
        } catch (error: any) {
            this.logger.error(`Error verifying OTP for user ${userId}: ${error.message}`, { ...context, status: 'ERROR' }, error);
            throw new HttpError(500, 'Failed to verify OTP. Please try again.');
        }
    }
}

// Export a singleton instance of OtpService for easy injection throughout the application.
// Ensure globalLogger and redisClient are correctly imported and instantiated elsewhere in your app's entry point.
import {logger as globalLogger } from '@workspace/backend-common/logger';

import { IOtpService } from '../interfaces/auth.interfaces';
import { ISmsService, twilioSmsService } from '@workspace/backend-common/sms'; // Import the Twilio SMS service and its interface


// The twilioSmsService instance is imported directly from its module.
export const otpService = new OtpService(globalLogger, redisClient, twilioSmsService);
