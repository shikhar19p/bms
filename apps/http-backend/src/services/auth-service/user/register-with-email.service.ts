// bms-monorepo/apps/http-backend/src/services/auth-service/user/register-with-email.service.ts

import validator from 'validator';
import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger } from '@workspace/backend-common/logger';
import { getRequestContext } from '@workspace/backend-common/middleware';
import {  Account, Role, prismaClient } from '@workspace/db/client'; // Import Account and Role


// Interfaces for dependencies
import { ICredentialService, IEmailVerificationService, IRegisterWithEmailService } from '../interfaces/auth.interfaces';
import { LoginVerificationResult } from '../types/auth.types';

// Concrete services for injection

import { credentialService } from './credential.service'; // Import the singleton credentialService
import { emailVerificationService } from '../verification-service/email-verification.service'; // Import the email verification service

import { TokenType, UserRole } from '@workspace/common/enums';
import { AccessTokenService } from '../../token-service/user/access-token.service';
import { RefreshTokenService } from '../../token-service/user/refresh-token.service';
export class RegisterWithEmailService implements IRegisterWithEmailService {
    constructor(
        private readonly logger: ILogger,
        private readonly credentialService: ICredentialService,
        private readonly emailVerificationService: IEmailVerificationService,
        private readonly accessTokenService: AccessTokenService,
        private readonly refreshTokenService: RefreshTokenService,
    ) {}

    /**
     * Registers a new user with email and password.
     * This method handles email/password registration, checks for existing accounts,
     * sends email verification, and issues initial login tokens.
     *
     * @param {string} email - The user's email address.
     * @param {string} password - The user's chosen password.
     * @param {string} ipAddress - The IP address of the request.
     * @param {string} userAgent - The user-agent string of the request.
     * @param {string} [name] - Optional: The user's name.
     * @param {string} [phone] - Optional: The user's phone number.
     * @param {string} [correlationId] - Optional: Unique ID for the request trace.
     * @returns {Promise<LoginVerificationResult>} A promise that resolves with the access and refresh tokens and user object.
     * @throws {HttpError} Throws an error if validation fails, email already exists, or registration fails.
     */
    public async register(
        email: string,
        password: string,
        ipAddress: string,
        userAgent: string,
        name?: string,
        phone?: string,
        correlationId?: string
    ): Promise<LoginVerificationResult> {
        const context = { ...getRequestContext(), module: 'RegisterWithEmailService', action: 'REGISTER', identifier: email };
        this.logger.info('Registration process started.', context);


        // 1. Input Validation
        if (!validator.isEmail(email)) {
            this.logger.warn(`Registration attempt with invalid email format: ${email}.`, context);
            throw new HttpError(400, 'Invalid email address.');
        }
        if (password.length < 8) { // Basic password strength check
            this.logger.warn(`Registration attempt with weak password for email: ${email}.`, context);
            throw new HttpError(400, 'Password must be at least 8 characters long.');
        }
        if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
            this.logger.warn(`Registration attempt with invalid phone format: ${phone}.`, context);
            throw new HttpError(400, 'Invalid phone number format.');
        }

        // 2. Account Existence Check
        this.logger.info('Checking for existing account.', context);
        const existingAccount = await prismaClient.account.findUnique({
            where: { email },
            include: { role: true },
        });

        if (existingAccount) {
            const existingAccountContext = { ...context, resourceId: existingAccount.id };
            if (existingAccount.googleId) {
                this.logger.warn(`Registration attempt for email '${email}' linked to Google.`, { ...existingAccountContext, status: 'CONFLICT', action: 'REGISTRATION_FAILED_GOOGLE_LINKED' });
                throw new HttpError(409, "An account with this email exists and is linked to Google. Please sign in with Google or link this account.");
            } else {
                this.logger.warn(`Registration attempt for existing email/password account: ${email}.`, { ...existingAccountContext, status: 'CONFLICT', action: 'REGISTRATION_FAILED_EMAIL_EXISTS' });
                throw new HttpError(409, "An account with this email already exists.");
            }
        }

        // 3. Hash Password
        this.logger.info('Hashing password.', context);
        const hashedPassword = await this.credentialService.hashPassword(password);

        // 4. Determine User Role (Always default to USER role for new registrations)
        const desiredRoleName = UserRole.USER;
        this.logger.info(`Finding role: ${desiredRoleName}`, context);
        const role = await prismaClient.role.findUnique({
            where: { name: desiredRoleName },
        });

        if (!role) {
            this.logger.error(`Default user role '${desiredRoleName}' not found. Please ensure it exists in the database.`, { ...context, status: 'ERROR' });
            throw new HttpError(500, `Default user role not configured.`);
        }

        // 5. Create Account
        this.logger.info('Creating new account in database.', context);
        let newUser: Account & { role: Role };
        try {
            newUser = await prismaClient.account.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null,
                    phone: phone || null,
                    isEmailVerified: false,
                    isPhoneVerified: false,
                    googleId: null,
                    roleId: role.id,
                    lastLoginAt: new Date(),
                    lastIPAddress: ipAddress,
                    lastUserAgent: userAgent,
                },
                include: { role: true },
            }) as (Account & { role: Role });
            this.logger.success(`New user registered successfully: ${newUser.email} (ID: ${newUser.id}).`, { ...context, status: 'SUCCESS', resourceId: newUser.id, actorId: newUser.id, actorType: 'USER' });
        } catch (error: any) {
            this.logger.error(`Failed to create new account for email ${email}: ${error.message}`, { ...context, status: 'DB_ERROR' }, error);
            throw new HttpError(500, 'Failed to register user. Please try again.');
        }

        // 6. Send Email Verification
        this.logger.info(`Sending email verification to new user ${newUser.id}.`, { ...context, resourceId: newUser.id });
        await this.emailVerificationService.resendEmailVerification(newUser.id, newUser.email, newUser.roleId);


        // 7. Generate Initial Login Tokens
        this.logger.info('Generating initial login tokens.', { ...context, resourceId: newUser.id });
        const accessToken = await this.accessTokenService.generateAccessToken({
            userId: newUser.id,
            roleId: newUser.roleId,
            userRole: newUser.role.name as UserRole,
            type: TokenType.ACCESS,
            ...(newUser.role.name === UserRole.VENUE_OWNER && newUser.venueId && { venueId: newUser.venueId }),
        });
        const refreshToken = await this.refreshTokenService.generateRefreshToken({
            userId: newUser.id,
            roleId: newUser.roleId,
            type: TokenType.REFRESH,
        });

        // Return tokens and user object for immediate login
        return { user: newUser, tokens: { accessToken, refreshToken } };
    }
}

// Export a singleton instance
import { logger as
     globalLogger } from '@workspace/backend-common/logger';

// Instantiate token services (assuming they are not already singletons elsewhere)
const accessTokenServiceInstance = new AccessTokenService(globalLogger);
const refreshTokenServiceInstance = new RefreshTokenService(globalLogger);

export const registerWithEmailService = new RegisterWithEmailService(
    globalLogger,
    credentialService,
    emailVerificationService,
    accessTokenServiceInstance,
    refreshTokenServiceInstance
);
