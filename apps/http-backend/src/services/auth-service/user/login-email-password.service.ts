// bms-monorepo/apps/http-backend/src/services/auth-service/user/login-email-password.service.ts

import validator from 'validator';
import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger } from '@workspace/backend-common/logger';
import { getRequestContext } from '@workspace/backend-common/middleware';
import { Account, Role } from '@workspace/db/client';


// Interfaces for dependencies (relative path within auth-service)
import { ICredentialService, IOtpService, IEmailVerificationService, ILoginEmailPasswordService } from '../interfaces/auth.interfaces';

// Concrete services for injection (relative paths within services)
import { AccessTokenService } from '../../token-service/user/access-token.service';
import { RefreshTokenService } from '../../token-service/user/refresh-token.service';

// Imports from common package (Turborepo alias)

import { OtpEmailSenderService } from '../../email-service/otp-email-sender.service';
// NEW: Import the OtpEmailSenderService for injection


// NEW: Import the singleton instances of the services used in the export
import { credentialService } from './credential.service';
import { otpService } from './otp.service';
import { emailVerificationService } from '../verification-service/email-verification.service';


export class LoginEmailPasswordService implements ILoginEmailPasswordService {
    constructor(
        private readonly logger: ILogger,
        private readonly credentialService: ICredentialService,
        private readonly otpService: IOtpService, // For MFA OTP generation/storage
        private readonly emailVerificationService: IEmailVerificationService, // For re-sending verification emails (business logic)
        private readonly accessTokenService: AccessTokenService, // For generating access tokens
        private readonly refreshTokenService: RefreshTokenService, // For generating refresh tokens
        private readonly otpEmailSenderService: OtpEmailSenderService // NEW: Injected OtpEmailSenderService
    ) {}

    /**
     * Authenticates a user using email/phone and password.
     * Initiates MFA if enabled, or returns tokens directly if no MFA.
     * @param {string} identifier - The user's email or phone number.
     * @param {string} password - The user's password.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @returns {Promise<{ user: Account & { role: Role }, mfaToken?: string, message?: string, accessToken?: string, refreshToken?: string }>}
     * @throws {HttpError} Throws an error if credentials invalid, email unverified, account locked, or MFA setup issue.
     */
    public async login(
        identifier: string,
        password: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<{ user: Account & { role: Role }, mfaToken?: string, message?: string, accessToken?: string, refreshToken?: string }> {
        const context = { ...getRequestContext(), module: 'LoginEmailPasswordService', action: 'LOGIN', identifier };
        this.logger.info('Login process started.', context);

        const isEmail = validator.isEmail(identifier);
        const isPhone = !isEmail && validator.isMobilePhone(identifier, 'any', { strictMode: false });

        if (!isEmail && !isPhone) {
            this.logger.warn(`Login attempt with invalid identifier format: ${identifier}.`, context);
            throw new HttpError(400, 'Identifier must be a valid email or phone number.');
        }

        this.logger.info('Finding user by identifier.', context);
        const user = await this.credentialService.findUserByIdentifier(identifier, isEmail, isPhone);

        if (!user) {
            this.logger.warn(`Login attempt for non-existent user: ${identifier}.`, context);
            throw new HttpError(401, "Invalid credentials.");
        }

        const userContext = { ...context, resourceId: user.id, actorId: user.id, actorType: 'USER' as const };
        this.logger.info('User found. Proceeding with authentication checks.', userContext);


        if (isEmail && !user.password && user.googleId) {
            this.logger.warn(`Login attempt with email/password for Google-linked account: ${user.email} (ID: ${user.id}).`, userContext);
            throw new HttpError(401, "This email is linked to a Google account. Please sign in with Google.");
        }

        if (isEmail && !user.password && !user.googleId) {
            this.logger.warn(`Login attempt with email/password for account with no password and no Google ID: ${user.email} (ID: ${user.id}).`, userContext);
            throw new HttpError(401, "Account not set up for password login. Please register or use another method.");
        }

        if (user.password && !user.isEmailVerified) {
            this.logger.warn(`Login attempt for unverified email: ${user.email} (ID: ${user.id}). Resending verification email.`, userContext);
            await this.emailVerificationService.resendEmailVerification(user.id, user.email, user.roleId);
            throw new HttpError(403, "Please verify your email address. A new verification link has been sent.");
        }

        if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
            const remainingTime = Math.ceil((user.lockUntil.getTime() - new Date().getTime()) / 60000);
            this.logger.warn(`Login attempt for locked account: ${user.id}. Remaining lock time: ${remainingTime} min.`, userContext);
            throw new HttpError(403, `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`);
        }

        this.logger.info('Validating password.', userContext);
        const isPasswordValid = await this.credentialService.comparePasswords(password, user.password);
        if (!isPasswordValid) {
            await this.credentialService.handleFailedLoginAttempt(user.id, ipAddress, userAgent);
            this.logger.warn(`Password mismatch for user ${user.id}.`, userContext);
            throw new HttpError(401, "Invalid credentials.");
        }

        this.logger.info('Password validation successful. Resetting login attempts.', userContext);
        await this.credentialService.resetLoginAttempts(user.id, ipAddress, userAgent);

        if (user.isMfaEnabled && user.mfaMethod === 'EMAIL') {
            this.logger.info('MFA is enabled for user. Initiating MFA flow.', userContext);
            if (!user.email) {
                this.logger.error(`User ${user.id} has EMAIL MFA enabled but no email address.`, userContext);
                throw new HttpError(500, "MFA configuration error: Email not found for MFA.");
            }
            const mfaToken = this.otpService.generateMfaToken(user.id);
            const otp = await this.otpService.generateAndStoreOtp(user.id);
            await this.otpEmailSenderService.sendOtpEmail(user.email, otp);

            this.logger.success(`MFA initiated for user ${user.id}. OTP sent to email.`, { ...userContext, status: 'MFA_INITIATED' });
            return { user, mfaToken, message: "MFA required. OTP sent to your email." };
        }

        this.logger.info('MFA not required. Generating tokens.', userContext);
        const accessToken = await this.accessTokenService.generateAccessToken({
            userId: user.id,
            roleId: user.roleId,
            userRole: user.role.name as UserRole,
            type: TokenType.ACCESS,
            ...(user.role.name === UserRole.VENUE_OWNER && user.venueId && { venueId: user.venueId }),
        });
        const refreshToken = await this.refreshTokenService.generateRefreshToken({
            userId: user.id,
            roleId: user.roleId,
            type: TokenType.REFRESH,
        });

        this.logger.success(`User ${user.id} successfully logged in without MFA.`, { ...userContext, status: 'SUCCESS' });
        return { user, accessToken, refreshToken };
    }
}

// Export a singleton instance
import { logger as globalLogger } from '@workspace/backend-common/logger';
import { otpEmailSenderService } from '../../email-service/'; // Import the singleton instance for injection
import { TokenType, UserRole } from '@workspace/common/enums';


// Instantiate token services (assuming they are not already singletons elsewhere)
const accessTokenServiceInstance = new AccessTokenService(globalLogger);
const refreshTokenServiceInstance = new RefreshTokenService(globalLogger);

export const loginEmailPasswordService = new LoginEmailPasswordService(
    globalLogger,
    credentialService,
    otpService,
    emailVerificationService,
    accessTokenServiceInstance,
    refreshTokenServiceInstance,
    otpEmailSenderService
);
