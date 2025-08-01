// bms-monorepo/apps/http-backend/src/services/auth-service/user/phone-verification.service.ts

import validator from 'validator';
import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { prismaClient, Account } from '@workspace/db/client';

// Interfaces for dependencies
import { ICredentialService, IOtpService } from '../interfaces/auth.interfaces';

// Concrete services for injection (singletons)
import { credentialService } from './credential.service';
import { otpService } from './otp.service'; // Assuming otpService is exported as a singleton

export class PhoneVerificationService {
    constructor(
        private readonly logger: ILogger,
        private readonly credentialService: ICredentialService,
        private readonly otpService: IOtpService,
    ) {}

    /**
     * Initiates the phone verification process for an already logged-in user.
     * Generates an OTP and sends it to the provided phone number.
     * This method assumes the user is already authenticated via a middleware.
     *
     * @param {string} userId - The ID of the currently authenticated user.
     * @param {string} phoneNumber - The phone number to be verified.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Optional: Unique ID for the request trace.
     * @returns {Promise<{ message: string }>} A message indicating OTP sent.
     * @throws {HttpError} If validation fails, phone number is already in use, or OTP sending fails.
     */
    public async sendPhoneVerificationOtp(
        userId: string,
        phoneNumber: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<{ message: string }> {
        const context: LogContext = {
            module: 'PhoneVerificationService',
            action: 'SEND_PHONE_VERIFICATION_OTP',
            resourceType: 'User',
            resourceId: userId,
            actorId: userId,
            actorType: 'USER',
            identifier: phoneNumber,
            ipAddress,
            userAgent,
            correlationId
        };

        // 1. Input Validation
        if (!validator.isMobilePhone(phoneNumber, 'any', { strictMode: false })) {
            this.logger.warn(`Invalid phone number format for user ${userId}: ${phoneNumber}.`, context);
            throw new HttpError(400, 'Invalid phone number format.');
        }

        // 2. Check if phone number is already in use by another account
        const existingAccountWithPhone = await this.credentialService.findUserByIdentifier(phoneNumber, false, true);

        if (existingAccountWithPhone && existingAccountWithPhone.id !== userId) {
            this.logger.warn(`Phone number ${phoneNumber} already registered by another user (${existingAccountWithPhone.id}).`, context, { status: 'CONFLICT' });
            throw new HttpError(409, 'This phone number is already associated with another account.');
        }

        // 3. Generate and Store OTP
        const otp = await this.otpService.generateAndStoreOtp(userId); // Use userId as key for OTP

        // 4. Send OTP via SMS
        await this.otpService.sendOtpSms(userId, phoneNumber, otp);

        this.logger.success(`Phone verification OTP sent to ${phoneNumber} for user ${userId}.`, context, { status: 'OTP_SENT' });
        return { message: "OTP sent to your phone for verification." };
    }

    /**
     * Verifies the OTP provided by the user for phone number verification.
     * If successful, updates the user's account with the verified phone number.
     *
     * @param {string} userId - The ID of the currently authenticated user.
     * @param {string} otp - The OTP provided by the user.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Optional: Unique ID for the request trace.
     * @returns {Promise<{ message: string; user: Account }>} A message and the updated user object.
     * @throws {HttpError} If OTP is invalid/expired or update fails.
     */
    public async verifyPhoneVerificationOtp(
        userId: string,
        otp: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<{ message: string; user: Account }> {
        const context: LogContext = {
            module: 'PhoneVerificationService',
            action: 'VERIFY_PHONE_VERIFICATION_OTP',
            resourceType: 'User',
            resourceId: userId,
            actorId: userId,
            actorType: 'USER',
            ipAddress,
            userAgent,
            correlationId
        };

        // 1. Verify OTP
        const isValidOtp = await this.otpService.verifyOtp(userId, otp);
        if (!isValidOtp) {
            this.logger.warn(`Invalid OTP provided for phone verification for user ${userId}.`, context, { status: 'FAILED' });
            throw new HttpError(401, "Invalid or expired OTP.");
        }

        // 2. Retrieve current user's phone number from DB (it might have been set during OTP send)
        const user = await prismaClient.account.findUnique({
            where: { id: userId },
            select: { phone: true } // Only fetch phone to confirm
        });

        if (!user || !user.phone) {
            this.logger.error(`User ${userId} or their phone number not found after OTP verification.`, context, { status: 'ERROR' });
            throw new HttpError(404, "User or phone number not found.");
        }

        // 3. Update Account with verified phone number
        try {
            const updatedAccount = await prismaClient.account.update({
                where: { id: userId },
                data: {
                    isPhoneVerified: true,
                    updatedAt: new Date(),
                    lastIPAddress: ipAddress, // Update last IP/UA on successful verification
                    lastUserAgent: userAgent,
                },
            });
            this.logger.success(`Phone number ${user.phone} verified for user ${userId}.`, context, { status: 'SUCCESS' });
            return { message: "Phone number verified successfully.", user: updatedAccount };
        } catch (error: any) {
            this.logger.error(`Failed to update phone verification status for user ${userId}: ${error.message}`, { ...context, status: 'DB_ERROR' }, error);
            throw new HttpError(500, 'Failed to verify phone number. Please try again.');
        }
    }
}

// Export a singleton instance of PhoneVerificationService
// Ensure all dependencies are correctly instantiated and passed here.
// globalLogger, credentialService, and otpService are assumed to be singletons exported from their modules.
export const phoneVerificationService = new PhoneVerificationService(
    globalLogger,
    credentialService,
    otpService
);
