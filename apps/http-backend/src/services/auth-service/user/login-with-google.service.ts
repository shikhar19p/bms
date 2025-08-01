// bms-monorepo/apps/http-backend/src/services/auth-service/user/login-with-google.service.ts

import jwt from 'jsonwebtoken';
import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { prismaClient} from '@workspace/db/client';


import { LoginVerificationResult } from '../types/auth.types';
import { config, jwtConfig } from '@workspace/backend-common/config';

// Import the GoogleAuthClient interface and concrete implementation
import { IGoogleAuthClient, ILoginWithGoogleService } from '../interfaces/auth.interfaces';
import { OAuth2Client } from 'google-auth-library'; // Import the real Google OAuth client library

// Concrete Google OAuth2Client instance (still here, as it's a direct dependency of this service's core logic)
const googleOAuthClientInstance = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
);

// Implement IGoogleAuthClient using OAuth2Client
class GoogleAuthClient implements IGoogleAuthClient {
    private client: OAuth2Client;
    private readonly logger: ILogger;

    constructor(client: OAuth2Client, logger: ILogger) {
        this.client = client;
        this.logger = logger;
    }

    public generateAuthUrl(scopes: string[], accessType: 'online' | 'offline', prompt: 'none' | 'consent' | 'select_account', redirectUri: string): string {
        return this.client.generateAuthUrl({ access_type: accessType, prompt: prompt, scope: scopes.join(' '), redirect_uri: redirectUri });
    }

    public async getToken(code: string): Promise<{ id_token?: string | null; access_token?: string | null; refresh_token?: string | null; scope?: string | null; expires_in?: number | null; token_type?: string | null; }> {
        try {
            const { tokens } = await this.client.getToken(code);
            return tokens;
        } catch (error: any) {
            this.logger.error(`Failed to exchange Google authorization code for tokens: ${error.message}`, { module: 'GoogleAuthClient', action: 'GET_TOKEN_FAILED' }, error);
            throw new HttpError(500, 'Failed to get Google tokens.');
        }
    }

    public async verifyIdToken(idToken: string): Promise<{ email: string; name: string; googleId: string; }> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: idToken,
                audience: config.google.clientId,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.sub || !payload.email) {
                this.logger.warn('Invalid Google ID token payload received.', { module: 'GoogleAuthClient', action: 'VERIFY_ID_TOKEN_FAILED' });
                throw new HttpError(401, 'Invalid Google ID token payload.');
            }
            return {
                email: payload.email.toLowerCase(),
                name: payload.name || payload.given_name || payload.email,
                googleId: payload.sub,
            };
        } catch (error: any) {
            this.logger.error(`Google ID token verification failed: ${error.message}`, { module: 'GoogleAuthClient', action: 'VERIFY_ID_TOKEN_FAILED' }, error);
            throw new HttpError(401, `Google ID token verification failed: ${error.message}`);
        }
    }
}

// Export the concrete GoogleAuthClient instance for injection
export const googleAuthClient = new GoogleAuthClient(googleOAuthClientInstance, globalLogger);


export class LoginWithGoogleService implements ILoginWithGoogleService {
    constructor(
        private readonly logger: ILogger,
        private readonly accessTokenService: AccessTokenService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly redisClient: IRedisClient, // Still needed for storing linking token
        private readonly googleAuthClient: IGoogleAuthClient // Injected Google Auth Client
    ) {}

    /**
     * Generates the Google OAuth consent screen URL.
     * This method is typically called by a controller to initiate the OAuth flow.
     * @returns {string} The URL to redirect the user to for Google consent.
     */
    public generateGoogleAuthUrl(): string {
        const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
        return this.googleAuthClient.generateAuthUrl(scopes, 'offline', 'consent', config.google.redirectUri);
    }

    /**
     * Handles the Google OAuth callback, authenticates the user, and manages account linking/creation.
     * This method expects the Google authorization code, which it exchanges for tokens and profile data.
     * @param {string} code - The authorization code received from Google.
     * @param {string} ipAddress - The IP address of the request.
     * @param {string} userAgent - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @returns {Promise<LoginVerificationResult | { message: string; redirectTo: string; linkingToken: string }>}
     * @throws {HttpError} Throws an error if Google token is invalid, or account linking issues.
     */
    public async login(
        code: string,
        ipAddress: string,
        userAgent: string,
        correlationId?: string
    ): Promise<LoginVerificationResult | { message: string; redirectTo: string; linkingToken: string }> {
        const context: LogContext = {
            module: 'LoginWithGoogleService',
            action: 'LOGIN_GOOGLE',
            ipAddress,
            userAgent,
            correlationId
        };

        let googleTokens;
        let googleProfile;
        try {
            googleTokens = await this.googleAuthClient.getToken(code);
            if (!googleTokens.id_token) {
                this.logger.warn(`Google ID token not found after code exchange.`, context);
                throw new HttpError(401, 'Google ID token not found.');
            }
            googleProfile = await this.googleAuthClient.verifyIdToken(googleTokens.id_token);
            context.identifier = googleProfile.email;
        } catch (error: any) {
            this.logger.warn(`Google OAuth flow failed during token exchange or ID token verification.`, context, { status: 'FAILED' }, error);
            throw new HttpError(401, `Google login failed: ${error.message}`);
        }

        const { googleId, email, name } = googleProfile;

        // 1. Account Check by googleId
        let user = await prismaClient.account.findUnique({
            where: { googleId },
            include: { role: true },
        });

        if (user) {
            // Existing Google-linked account
            context.resourceId = user.id;
            context.actorId = user.id;
            context.actorType = 'USER';
            this.logger.info(`Existing Google account login: ${user.email} (ID: ${user.id}).`, context);

            // Update Google tokens (access, refresh, scope)
            await prismaClient.account.update({
                where: { id: user.id },
                data: {
                    googleAccessToken: googleTokens.access_token,
                    googleRefreshToken: googleTokens.refresh_token,
                    googleAuthScope: googleTokens.scope,
                    lastLoginAt: new Date(),
                    lastIPAddress: ipAddress,
                    lastUserAgent: userAgent,
                },
            });

            const accessToken = await this.accessTokenService.generateAccessToken({
                userId: user.id,
                roleId: user.roleId,
                userRole: user.role.name as UserRole,
                type: TokenType.ACCESS,
                // Conditionally add venueId for specific venue-related admin/manager roles
                // ...(user.role.name === UserRole.VENUE_OWNER && user.venueId && { venueId: user.venueId }),
                // ...(user.role.name === UserRole.VENUE_ADMIN && user.venueId && { venueId: user.venueId }),
                // ...(user.role.name === UserRole.SECONDARY_VENUE_NAME_MANAGER && user.venueId && { venueId: user.venueId }),
                // ...(user.role.name === UserRole.VENUE_BOOKING_MANAGER && user.venueId && { venueId: user.venueId }),
                // ...(user.role.name === UserRole.VENUE_OPERATIONS_MANAGER && user.venueId && { venueId: user.venueId }),
                // // For regional admins, you might add 'regionId' or 'managedRegionIds' to the payload
                // ...(user.role.name === UserRole.BMSP_REGIONAL_VENUES_ADMIN && user.managedRegionIds && { managedRegionIds: user.managedRegionIds }),
            });
            const refreshToken = await this.refreshTokenService.generateRefreshToken({
                userId: user.id,
                roleId: user.roleId,
                type: TokenType.REFRESH,
            });

            return { user, tokens: { accessToken, refreshToken } };
        }

        // 2. Account Check by email (Linking Scenario)
        user = await prismaClient.account.findUnique({
            where: { email },
            include: { role: true },
        });

        if (user) {
            context.resourceId = user.id;
            context.actorId = user.id;
            context.actorType = 'USER';

            if (user.googleId && user.googleId !== googleId) {
                this.logger.warn(`Email ${user.email} already linked to a different Google account.`, context, { status: 'CONFLICT' });
                throw new HttpError(409, "Email already linked to another Google account.");
            } else if (!user.googleId) { // Existing email/password account, not linked to Google
                this.logger.info(`Existing email/password account found for linking: ${user.email} (ID: ${user.id}).`, context);

                // Generate a linking token (JWT containing userId of the existing account, and Google profile data)
                const linkingPayload = {
                    userId: user.id,
                    googleId,
                    email,
                    googleAccessToken: googleTokens.access_token,
                    googleRefreshToken: googleTokens.refresh_token,
                    googleAuthScope: googleTokens.scope,
                    roleId: user.roleId,
                };
                const linkingToken = jwt.sign(linkingPayload, jwtConfig.jwt.linking.secret, {
                    expiresIn: jwtConfig.jwt.linking.expirationSeconds, // Use seconds
                });

                // Store linkingToken in Redis for verification (optional, but good for single-use)
                await this.redisClient.set(`linking:${user.id}`, linkingToken, { EX: jwtConfig.jwt.linking.expirationSeconds });

                // Signal frontend to redirect for linking confirmation
                this.logger.info(`Redirecting user ${user.id} to link Google account.`, { ...context, status: 'REDIRECT_FOR_LINKING' });
               throw new HttpError(
    200, // Status code
    "Account with this email found, requires linking.", // Message
    { // Options object
        details: { // Assign to the 'details' property
            redirectTo: `${config.userWebUrl}/link-account`,
            linkingToken
        }
    }
);
            }
        }

        // 3. No matching account found (New Google User)
        this.logger.info(`Creating new account for Google user: ${email}.`, context);
        const defaultRole = await prismaClient.role.findUnique({ where: { name: UserRole.USER } });
        if (!defaultRole) {
            this.logger.error(`Default user role '${UserRole.USER}' not found during Google registration.`, context, { status: 'ERROR' });
            throw new HttpError(500, 'Default user role not configured.');
        }

        const newAccount = await prismaClient.account.create({
            data: {
                email,
                name,
                googleId,
                googleAccessToken: googleTokens.access_token,
                googleRefreshToken: googleTokens.refresh_token,
                googleAuthScope: googleTokens.scope,
                isEmailVerified: true, // Google verifies the email
                roleId: defaultRole.id,
                password: null, // No password for Google-only accounts
                phone: null,
                isPhoneVerified: false,
                lastLoginAt: new Date(),
                lastIPAddress: ipAddress,
                lastUserAgent: userAgent,
            },
            include: { role: true },
        });
        context.resourceId = newAccount.id;
        context.actorId = newAccount.id;

        const accessToken = await this.accessTokenService.generateAccessToken({
            userId: newAccount.id,
            roleId: newAccount.roleId,
            userRole: newAccount.role.name as UserRole,
            type: TokenType.ACCESS,
        });
        const refreshToken = await this.refreshTokenService.generateRefreshToken({
            userId: newAccount.id,
            roleId: newAccount.roleId,
            type: TokenType.REFRESH,
        });

        this.logger.success(`New Google account created and logged in: ${newAccount.email} (ID: ${newAccount.id}).`, context, { status: 'SUCCESS' });
        return { user: newAccount, tokens: { accessToken, refreshToken } };
    }
    // Removed linkAccount and unlinkGoogleAccount methods
}

// Export a singleton instance of LoginWithGoogleService
import { IRedisClient, redisClient } from '@workspace/backend-common/data-access/redis'; // Corrected import
import { AccessTokenService } from '../../token-service/user/access-token.service';
import { RefreshTokenService } from '../../token-service/user/refresh-token.service';
import { TokenType, UserRole } from '@workspace/common/enums';

// Instantiate token services (if not already singletons elsewhere)
const accessTokenServiceInstance = new AccessTokenService(globalLogger);
const refreshTokenServiceInstance = new RefreshTokenService(globalLogger);

export const loginWithGoogleService = new LoginWithGoogleService(
    globalLogger,
    accessTokenServiceInstance,
    refreshTokenServiceInstance,
    redisClient, // Still needed for storing linking token
    googleAuthClient // The concrete GoogleAuthClient instance
);
