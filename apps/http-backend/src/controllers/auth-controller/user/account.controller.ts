// bms-monorepo/apps/http-backend/src/controllers/auth-controller/account.controller.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@workspace/backend-common/http-error';
import { ILogger, LogContext } from '@workspace/backend-common/logger';
import { config, jwtConfig } from '@workspace/backend-common/config';

// Import service interfaces
import {
    IGoogleAccountLinkingService,
    IPasswordResetService, // Future: for password reset flows
} from '../../../services/auth-service/interfaces/auth.interfaces';

import { PhoneVerificationService } from '../../../services/auth-service/user/phone-verification.service'; // Specific import for PhoneVerificationService

// Import concrete service instances (singletons)
import { googleAccountLinkingService } from '../../../services/auth-service/user/google-account-linking.service';
import { phoneVerificationService } from '../../../services/auth-service/user/phone-verification.service';
// import { passwordResetService } from '../../services/auth-service/user/reset-password.service'; // Future: Uncomment when implemented
import { logger as globalLogger } from '@workspace/backend-common/logger'; // Assuming globalLogger is available



export class AccountController {
    constructor(
        private readonly logger: ILogger,
        private readonly googleAccountLinkingService: IGoogleAccountLinkingService,
        private readonly phoneVerificationService: PhoneVerificationService,
        // private readonly passwordResetService: IPasswordResetService, // Future: Inject when implemented
    ) {}

     /**
     * Handles linking a Google account to an existing user account.
     * POST /api/auth/link-google-account
     * This route should be protected by authentication middleware.
     */
    public linkGoogleAccount = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'AccountController', action: 'LINK_GOOGLE_ACCOUNT_REQUEST' };
        const { linkingToken } = req.body;
        // Ensure ipAddress and userAgent are always strings, and handle array type for user-agent
        const ipAddress = req.ip || 'unknown';
        const userAgent = Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'] || 'unknown';
     
       

        // Ensure user is authenticated (middleware should handle this before reaching here)
        if (!req.user?.id) {
            this.logger.warn('Attempt to link Google account without authenticated user.', context);
            return next(new HttpError(401, 'Unauthorized: User not authenticated.'));
        }

        try {
            const result = await this.googleAccountLinkingService.linkAccount(linkingToken, ipAddress, userAgent);

            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
                expires: new Date(Date.now() + jwtConfig.jwt.refreshTokenExpirationSeconds * 1000),
            });
            return res.status(200).json({
                message: 'Google account linked successfully.',
                accessToken: result.tokens.accessToken,
                user: result.user,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles unlinking a Google account from an existing user account.
     * POST /api/auth/unlink-google-account
     * This route should be protected by authentication middleware.
     */
    public unlinkGoogleAccount = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'AccountController', action: 'UNLINK_GOOGLE_ACCOUNT_REQUEST' };
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        if (!req.user?.id) {
            this.logger.warn('Attempt to unlink Google account without authenticated user.', context);
            return next(new HttpError(401, 'Unauthorized: User not authenticated.'));
        }

        try {
            await this.googleAccountLinkingService.unlinkGoogleAccount(req.user.id, ipAddress, userAgent);   
            return res.status(200).json({ message: 'Google account unlinked successfully.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles sending OTP for phone number verification for an authenticated user.
     * POST /api/user/send-phone-otp (Protected)
     */
    public sendPhoneVerificationOtp = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'AccountController', action: 'SEND_PHONE_VERIFICATION_OTP_REQUEST' };
        const { phoneNumber } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        if (!req.user?.id) {
            this.logger.warn('Attempt to send phone verification OTP without authenticated user.', context);
            return next(new HttpError(401, 'Unauthorized: User not authenticated.'));
        }

        try {
            const result = await this.phoneVerificationService.sendPhoneVerificationOtp(req.user.id, phoneNumber, ipAddress, userAgent);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles verifying OTP for phone number verification for an authenticated user.
     * POST /api/user/verify-phone-otp (Protected)
     */
    public verifyPhoneVerificationOtp = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'AccountController', action: 'VERIFY_PHONE_VERIFICATION_OTP_REQUEST' };
        const { otp } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        if (!req.user?.id) {
            this.logger.warn('Attempt to verify phone verification OTP without authenticated user.', context);
            return next(new HttpError(401, 'Unauthorized: User not authenticated.'));
        }

        try {
            const result = await this.phoneVerificationService.verifyPhoneVerificationOtp(req.user.id, otp, ipAddress, userAgent);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    // Future: Password Reset Endpoints (request, reset)
    // public requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => { /* ... */ };
    // public resetPassword = async (req: Request, res: Response, next: NextFunction) => { /* ... */ };
}

export const accountController = new AccountController(
    globalLogger,
    googleAccountLinkingService,
    phoneVerificationService,
    // passwordResetService, // Future: Add when implemented
);
