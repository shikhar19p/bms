// bms-monorepo/apps/http-backend/src/services/auth-service/user/login-phone.service.ts

import validator from 'validator';
import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { Account, Role } from '@workspace/db/client';

// Interfaces for dependencies
import { IOtpService, ICredentialService, ILoginPhoneService } from '../interfaces/auth.interfaces';
import { PhoneLoginResult } from '../types/auth.types'; // Import the specific result type

// Concrete services for injection (singletons)
import { credentialService } from './credential.service';
import { otpService } from './otp.service';

export class LoginPhoneService implements ILoginPhoneService { // Now explicitly implementing the interface
    constructor(
        private readonly logger: ILogger,
        private readonly otpService: IOtpService, // For OTP generation/sending
        private readonly credentialService: ICredentialService // For finding user by phone
    ) {}

    /**
     * Initiates phone-based login by sending an OTP to the user's verified phone number.
     * @param {string} phone - The user's phone number.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @returns {Promise<PhoneLoginResult>} A promise that resolves with mfaToken, message, and the user object.
     * @throws {HttpError} Throws an error if phone number is invalid or not verified.
     */
    public async login(
        phone: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<PhoneLoginResult> { // Explicitly returning PhoneLoginResult
        const context: LogContext = {
            module: 'LoginPhoneService',
            action: 'LOGIN_PHONE',
            identifier: phone, // Using phone as identifier for logging
            ipAddress,
            userAgent,
            correlationId
        };

        // 1. Input Validation
        if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
            this.logger.warn(`Phone login attempt with invalid phone format: ${phone}.`, context);
            throw new HttpError(400, 'Invalid phone number format.');
        }

        // 2. Find user by phone number
        // We include role here because the LoginResult type expects it.
        const user = await this.credentialService.findUserByIdentifier(phone, false, true) as (Account & { role: Role });

        if (!user) {
            this.logger.warn(`Phone login attempt for non-existent user: ${phone}.`, context);
            // Security: Avoid revealing if user exists. Combine non-existent or unverified.
            throw new HttpError(401, "Account not found or phone not verified. Please register or login with email/Google.");
        }

        context.resourceId = user.id;
        context.actorId = user.id;
        context.actorType = 'USER';

        // 3. Check if phone is verified
        // If user is found by phone, but isPhoneVerified is false, or phone is null (data integrity issue)
        if (!user.isPhoneVerified || user.phone === null) {
            if (user.phone === null) {
                this.logger.error(`User ${user.id} found by phone but has null phone number. Data integrity issue.`, context);
                // This indicates a deeper problem, as findUserByIdentifier should only find by non-null phone.
                throw new HttpError(500, "Internal server error: User phone number data is inconsistent.");
            }
            this.logger.warn(`Phone login attempt for unverified phone: ${user.phone} (ID: ${user.id}).`, context);
            throw new HttpError(401, "Your phone number is not verified. Please login with email/password or Google, or verify your phone in your profile.");
        }

        // 4. Generate MFA token and send OTP
        const mfaToken = this.otpService.generateMfaToken(user.id);
        const otp = await this.otpService.generateAndStoreOtp(user.id);
        await this.otpService.sendOtpSms(user.id, user.phone, otp); // user.phone is now guaranteed to be string

        this.logger.success(`MFA initiated for user ${user.id} via phone. OTP sent.`, context, { status: 'MFA_INITIATED' });

        // Return the specific PhoneLoginResult type
        return {
            mfaToken,
            message: "MFA required. OTP sent to your phone.",
            user: user,
            mfaMethod: 'PHONE'
        };
    }
}

// Export a singleton instance of LoginPhoneService
// Ensure globalLogger, credentialService, and otpService are correctly imported and instantiated elsewhere.


export const loginPhoneService = new LoginPhoneService(
    globalLogger,
    otpService,
    credentialService
);
