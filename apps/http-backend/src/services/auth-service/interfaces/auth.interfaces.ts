// bms-monorepo/apps/http-backend/src/services/auth-service/interfaces/auth.interfaces.ts

import { Account, Role } from '@workspace/db/client';
import { LoginVerificationResult, LoginResult } from '../types/auth.types'; // Ensure LoginResult is also imported


/**
 * Interface for the Google OAuth client.
 * This abstracts the underlying Google API interactions for token verification.
 */
export interface IGoogleAuthClient {
    verifyIdToken(idToken: string): Promise<{
        email: string;
        name: string;
        googleId: string;
    }>;
    generateAuthUrl(scopes: string[], accessType: 'online' | 'offline', prompt: 'none' | 'consent' | 'select_account', redirectUri: string): string;
    getToken(code: string): Promise<{
        id_token?: string | null;
        access_token?: string | null;
        refresh_token?: string | null;
        scope?: string | null;
        expires_in?: number | null;
        token_type?: string | null;
    }>;
}

/**
 * Interface for the Credential Service.
 * Handles user lookup, password operations, and login attempt management.
 */
export interface ICredentialService {
    findUserByIdentifier(identifier: string, isEmail: boolean, isPhone: boolean): Promise<(Account & { role: Role }) | null>;
    comparePasswords(plainPassword: string, hashedPassword?: string | null): Promise<boolean>;
    hashPassword(plainPassword: string): Promise<string>;
    handleFailedLoginAttempt(userId: string, ipAddress?: string | null, userAgent?: string | null): Promise<void>;
    resetLoginAttempts(userId: string, ipAddress?: string | null, userAgent?: string | null): Promise<void>;
    updatePassword(userId: string, newHashedPassword: string): Promise<void>;
    updateAccountFields(userId: string, data: Partial<Account>): Promise<Account>;
}

/**
 * Interface for the OTP Service.
 * Handles generation, storage, sending (SMS), and verification of One-Time Passwords.
 */
export interface IOtpService {
    generateMfaToken(userId: string): string;
    generateAndStoreOtp(userId: string): Promise<string>;
    sendOtpSms(userId: string, phoneNumber: string, otp: string): Promise<void>;
    verifyOtp(userId: string, otp: string): Promise<boolean>;
}

/**
 * Interface for the Register with Email Service.
 * Handles new user registration via email and password.
 */
export interface IRegisterWithEmailService {
    register(
        email: string,
        password: string,
        ipAddress: string,
        userAgent: string,
        name?: string,
        phone?: string,
        correlationId?: string
    ): Promise<LoginVerificationResult>;
}

/**
 * Interface for the Email Verification Service.
 * Handles the verification of email addresses using tokens.
 */
export interface IEmailVerificationService {
    resendEmailVerification(userId: string, email: string, roleId: string, correlationId?: string): Promise<void>;
    verifyEmail(token: string, userEmail: string, ipAddress?: string, userAgent?: string, correlationId?: string): Promise<Account>;
}

/**
 * Interface for the Password Reset Service.
 * Handles requesting and performing password resets.
 */
export interface IPasswordResetService {
    requestPasswordReset(email: string, ipAddress?: string, userAgent?: string, correlationId?: string): Promise<void>;
    resetPassword(token: string, newPassword: string, ipAddress?: string, userAgent?: string, correlationId?: string): Promise<void>;
}

/**
 * Interface for the Login Email/Password Service.
 * Handles the primary login flow with email/password.
 */
export interface ILoginEmailPasswordService {
    login(
        identifier: string,
        password: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<{ user: Account & { role: Role }, mfaToken?: string, message?: string, accessToken?: string, refreshToken?: string }>;
}

/**
 * Interface for the Login Phone Service.
 * Handles the primary login flow with phone number (initiates phone MFA).
 */
export interface ILoginPhoneService { // <-- This is now correctly exported
    login(
        phone: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<LoginResult>; // Assuming LoginResult is defined in auth.types.ts
}

/**
 * Interface for the Login MFA Service.
 * Handles the verification of OTPs for Multi-Factor Authentication.
 */
export interface ILoginMfaService {
    verifyLoginOTP(
        mfaToken: string,
        otp: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<LoginVerificationResult>;
}

/**
 * Interface for the Login with Google Service (OAuth).
 * This defines the contract for handling Google sign-in and new account creation.
 */
export interface ILoginWithGoogleService {
    generateGoogleAuthUrl(): string;
    login(
        code: string,
        ipAddress: string,
        userAgent: string,
        correlationId?: string
    ): Promise<LoginVerificationResult | { message: string; redirectTo: string; linkingToken: string }>;
}

/**
 * Interface for the Google Account Linking Service.
 * This handles linking and unlinking Google accounts to/from existing user accounts.
 */
export interface IGoogleAccountLinkingService {
    linkAccount(
        linkingToken: string,
        ipAddress: string,
        userAgent: string,
        correlationId?: string
    ): Promise<LoginVerificationResult>;
    unlinkGoogleAccount(
        userId: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<void>;
}


