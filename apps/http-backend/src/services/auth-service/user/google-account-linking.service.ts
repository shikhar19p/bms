// bms-monorepo/apps/http-backend/src/services/auth-service/user/google-account-linking.service.ts

import jwt from 'jsonwebtoken';
import { HttpError } from "@workspace/backend-common/http-error";
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger';
import { prismaClient, Account, Role } from '@workspace/db/client';
import { jwtConfig } from '@workspace/backend-common/config';
import { IGoogleAccountLinkingService } from '../interfaces/auth.interfaces';
import { AccessTokenService } from '../../token-service/user/access-token.service';
import { RefreshTokenService } from '../../token-service/user/refresh-token.service';
import { IRedisClient } from '@workspace/backend-common/data-access/redis';
import { TokenType, UserRole } from '@workspace/common/enums';
import { LoginVerificationResult } from '../types/auth.types';

export class GoogleAccountLinkingService implements IGoogleAccountLinkingService {
    constructor(
        private readonly logger: ILogger,
        private readonly accessTokenService: AccessTokenService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly redisClient: IRedisClient
    ) {}

    /**
     * Links a Google account to an existing email/password account.
     * This method is called by the frontend after the user confirms linking.
     * @param {string} linkingToken - The temporary token issued during the initial Google login flow, containing Google OAuth details.
     * @param {string} ipAddress - The IP address of the request.
     * @param {string} userAgent - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @returns {Promise<LoginVerificationResult>} The updated user and new tokens.
     * @throws {HttpError} If the linking token is invalid, expired, or other linking issues occur.
     */
    public async linkAccount(
        linkingToken: string,
        ipAddress: string,
        userAgent: string,
        correlationId?: string
    ): Promise<LoginVerificationResult> {
        const context: LogContext = {
            module: 'GoogleAccountLinkingService', // Updated module name
            action: 'LINK_ACCOUNT',
            ipAddress,
            userAgent,
            correlationId
        };
        // Type for linking token payload, ensure it matches what's signed in LoginWithGoogleService
        let payload: { userId: string; googleId: string; email: string; googleAccessToken?: string; googleRefreshToken?: string; googleAuthScope?: string; roleId: string };
        let userId: string;

        try {
            // Verify the linking token using the specific linking secret
            payload = jwt.verify(linkingToken, jwtConfig.jwt.linking.secret) as typeof payload;
            userId = payload.userId;
            context.resourceId = userId;
            context.actorId = userId;
            context.actorType = 'USER';
        } catch (error: any) {
            this.logger.warn(`Invalid or expired linking token.`, context, { status: 'FAILED' }, error);
            throw new HttpError(401, 'Invalid or expired linking token.');
        }

        // Verify the linking token from Redis to ensure single-use and prevent replay attacks
        const storedLinkingToken = await this.redisClient.get(`linking:${userId}`);
        if (!storedLinkingToken || storedLinkingToken !== linkingToken) {
            this.logger.warn(`Linking token mismatch or not found in Redis for user ${userId}.`, context, { status: 'FAILED' });
            throw new HttpError(401, 'Invalid or expired linking token.');
        }
        await this.redisClient.del(`linking:${userId}`); // Consume the linking token immediately

        const { googleId, googleAccessToken, googleRefreshToken, email: googleEmail, googleAuthScope } = payload;

        const user = await prismaClient.account.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            this.logger.error(`User ${userId} not found during account linking.`, context, { status: 'ERROR' });
            throw new HttpError(404, 'User not found for linking.');
        }

        if (user.googleId) {
            this.logger.warn(`Account ${user.id} already linked to a Google account.`, context, { status: 'CONFLICT' });
            throw new HttpError(409, 'Account already linked to a Google account.');
        }

        // Double-check email consistency between existing user and Google profile from token
        if (user.email?.toLowerCase() !== googleEmail.toLowerCase()) {
            this.logger.warn(`Email mismatch during linking for user ${user.id}. User email: ${user.email}, Google email: ${googleEmail}.`, context, { status: 'CONFLICT' });
            throw new HttpError(400, 'Email mismatch: Cannot link to a different Google account.');
        }

        // Ensure the Google ID isn't already used by *another* account (race condition check)
        const existingGoogleAccount = await prismaClient.account.findUnique({ where: { googleId } });
        if (existingGoogleAccount && existingGoogleAccount.id !== userId) {
            this.logger.warn(`Google ID ${googleId} already linked to another user (${existingGoogleAccount.id}) during linking for user ${userId}.`, context, { status: 'CONFLICT' });
            throw new HttpError(409, 'This Google account is already linked to another user.');
        }

        const updatedUser = await prismaClient.account.update({
            where: { id: userId },
            data: {
                googleId,
                googleAccessToken,
                googleRefreshToken,
                googleAuthScope,
                isEmailVerified: true, // If not already, Google verifies it now
                updatedAt: new Date(),
                lastIPAddress: ipAddress,
                lastUserAgent: userAgent,
            },
            include: { role: true },
        }) as (Account & { role: Role });

        this.logger.success(`Account ${updatedUser.id} (${updatedUser.email}) successfully linked to Google.`, context, { status: 'SUCCESS' });

        // Generate new tokens for the now linked account
        const accessToken = await this.accessTokenService.generateAccessToken({
            userId: updatedUser.id,
            roleId: updatedUser.roleId,
            userRole: updatedUser.role.name as UserRole,
            type: TokenType.ACCESS,
            // Conditionally add venueId for specific venue-related admin/manager roles
            ...(updatedUser.role.name === UserRole.VENUE_OWNER && updatedUser.venueId && { venueId: updatedUser.venueId }),
            // ...(updatedUser.role.name === UserRole.VENUE_ADMIN && updatedUser.venueId && { venueId: updatedUser.venueId }),
            // ...(updatedUser.role.name === UserRole.SECONDARY_VENUE_NAME_MANAGER && updatedUser.venueId && { venueId: updatedUser.venueId }),
            // ...(updatedUser.role.name === UserRole.VENUE_BOOKING_MANAGER && updatedUser.venueId && { venueId: updatedUser.venueId }),
            // ...(updatedUser.role.name === UserRole.VENUE_OPERATIONS_MANAGER && updatedUser.venueId && { venueId: updatedUser.venueId }),
            // // For regional admins, you might add 'regionId' or 'managedRegionIds' to the payload
            // ...(updatedUser.role.name === UserRole.BMSP_REGIONAL_VENUES_ADMIN && updatedUser.managedRegionIds && { managedRegionIds: updatedUser.managedRegionIds }),
        });
        const refreshToken = await this.refreshTokenService.generateRefreshToken({
            userId: updatedUser.id,
            roleId: updatedUser.roleId,
            type: TokenType.REFRESH,
        });

        return { user: updatedUser, tokens: { accessToken, refreshToken } };
    }

    /**
     * Unlinks a Google account from an existing user account.
     * @param {string} userId The ID of the user whose Google account is to be unlinked.
     * @param {string} [ipAddress] - The IP address of the request.
     * @param {string} [userAgent] - The user-agent string of the request.
     * @param {string} [correlationId] - Unique ID for the request trace.
     * @returns {Promise<void>}
     * @throws {HttpError} If user not found, Google account not linked, or no password set (for Google-only accounts).
     */
    public async unlinkGoogleAccount(
        userId: string,
        ipAddress?: string,
        userAgent?: string,
        correlationId?: string
    ): Promise<void> {
        const context: LogContext = {
            module: 'GoogleAccountLinkingService', // Updated module name
            action: 'UNLINK_GOOGLE_ACCOUNT',
            resourceType: 'ACCOUNT',
            resourceId: userId,
            actorId: userId,
            actorType: 'USER',
            ipAddress,
            userAgent,
            correlationId
        };

        const user = await prismaClient.account.findUnique({ where: { id: userId } });

        if (!user) {
            this.logger.error(`User ${userId} not found for unlinking Google account.`, context, { status: 'NOT_FOUND' });
            throw new HttpError(404, 'User not found.');
        }

        if (!user.googleId) {
            this.logger.warn(`Google account is not linked to user ${userId}.`, context, { status: 'BAD_REQUEST' });
            throw new HttpError(400, 'Google account is not linked to this user.');
        }

        // Crucial: If this is a Google-only account (no password set), prevent unlinking unless they set a password first.
        if (!user.password) {
            this.logger.warn(`Attempt to unlink Google from passwordless account ${userId}.`, context, { status: 'PRECONDITION_FAILED' });
            throw new HttpError(400, 'Please set a password for your account before unlinking Google Sign-In to avoid losing access.');
        }

        await prismaClient.account.update({
            where: { id: userId },
            data: {
                googleId: null,
                googleAccessToken: null,
                googleRefreshToken: null,
                googleAuthScope: null,
                updatedAt: new Date(),
            },
        });

        this.logger.success(`Google account unlinked from user ${userId}.`, context, { status: 'SUCCESS' });
        // Optionally, revoke all refresh tokens for the user if unlinking significantly changes security posture.
        // await this.refreshTokenService.revokeAllUserRefreshTokens(userId);
    }
}

// Export a singleton instance of GoogleAccountLinkingService

import { redisClient } from '@workspace/backend-common/data-access/redis'; // Corrected import



// Instantiate token services (if not already singletons elsewhere)
const accessTokenServiceInstance = new AccessTokenService(globalLogger);
const refreshTokenServiceInstance = new RefreshTokenService(globalLogger);

export const googleAccountLinkingService = new GoogleAccountLinkingService(
    globalLogger,
    accessTokenServiceInstance,
    refreshTokenServiceInstance,
    redisClient
);
