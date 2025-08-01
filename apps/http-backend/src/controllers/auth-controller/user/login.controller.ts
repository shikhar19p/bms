// bms-monorepo/apps/http-backend/src/controllers/auth-controller/login.controller.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@workspace/backend-common/http-error';
import { ILogger, LogContext } from '@workspace/backend-common/logger';
import { config, jwtConfig } from '@workspace/backend-common/config';

// Import service interfaces
import {
    ILoginEmailPasswordService,
    ILoginPhoneService,
    ILoginWithGoogleService,
} from '../../../services/auth-service/interfaces/auth.interfaces';

// Import concrete service instances (singletons)
import { loginEmailPasswordService } from '../../../services/auth-service/user';
import { loginWithGoogleService } from '../../../services/auth-service/user/login-with-google.service';
import { loginPhoneService } from '../../../services/auth-service/user/login-phone.service';
import { logger as globalLogger } from '@workspace/backend-common/logger'; // Assuming globalLogger is available



export class LoginController {
    constructor(
        private readonly logger: ILogger,
        private readonly loginEmailPasswordService: ILoginEmailPasswordService,
        private readonly loginPhoneService: ILoginPhoneService,
        private readonly loginWithGoogleService: ILoginWithGoogleService,
    ) {}

    /**
     * Handles user login with email/phone and password.
     * Initiates MFA if required.
     * POST /api/auth/login
     */
    public login = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'LoginController', action: 'LOGIN_REQUEST' };
        const { identifier, password } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        try {
            const result = await this.loginEmailPasswordService.login(identifier, password, ipAddress, userAgent);

            if (result.mfaToken) {
                // MFA is required, send mfaToken to frontend
                return res.status(200).json({
                    message: result.message,
                    mfaRequired: true,
                    mfaToken: result.mfaToken,
                    userId: result.user.id,
                    mfaMethod: result.user.mfaMethod // Indicate method (EMAIL/PHONE)
                });
            } else if (result.accessToken && result.refreshToken) {
                // No MFA, direct login success
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: config.env === 'production',
                    sameSite: 'strict',
                    expires: new Date(Date.now() + jwtConfig.jwt.refreshTokenExpirationSeconds * 1000),
                });
                return res.status(200).json({
                    message: 'Login successful.',
                    accessToken: result.accessToken,
                    user: result.user,
                });
            } else {
                this.logger.error('Login service returned an unexpected result.', context, { result });
                throw new HttpError(500, 'An unexpected error occurred during login.');
            }
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles user login with phone number (initiates phone MFA).
     * POST /api/auth/login-phone
     */
    public loginPhone = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'LoginController', action: 'LOGIN_PHONE_REQUEST' };
        const { phone } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        try {
            const result = await this.loginPhoneService.login(phone, ipAddress, userAgent);

            // Phone login always initiates MFA
            return res.status(200).json({
                message: result.message,
                mfaRequired: true,
                mfaToken: result.mfaToken,
                userId: result.user?.id,
                mfaMethod: 'PHONE'
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Initiates Google OAuth flow.
     * GET /api/auth/google
     */
    public googleAuth = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'LoginController', action: 'GOOGLE_AUTH_INITIATE' };
        try {
            const authUrl = this.loginWithGoogleService.generateGoogleAuthUrl();
            this.logger.info('Redirecting to Google OAuth consent URL.', context, { authUrl });
            return res.redirect(authUrl);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles Google OAuth callback.
     * GET /api/auth/google/callback
     */
    public googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'LoginController', action: 'GOOGLE_AUTH_CALLBACK' };
        const { code } = req.query;
          const ipAddress = req.ip || 'unknown';
        const userAgent = Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'] || 'unknown';

        if (!code || typeof code !== 'string') {
            this.logger.warn('Google OAuth callback missing authorization code.', context, { query: req.query });
            return next(new HttpError(400, 'Authorization code missing.'));
        }

        try {
            const result = await this.loginWithGoogleService.login(code, ipAddress, userAgent );

            // Handle the linking scenario redirect (thrown as HttpError with 200 status by service)
            if ('redirectTo' in result && 'linkingToken' in result) {
                this.logger.info(`Google login requires account linking. Redirecting to: ${result.redirectTo}`, context);
                return res.redirect(`${result.redirectTo}?linkingToken=${result.linkingToken}`);
            }

            // Direct login/registration success
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
                expires: new Date(Date.now() + jwtConfig.jwt.refreshTokenExpirationSeconds * 1000),
            });
            this.logger.success(`Google login successful. Redirecting to: ${config.userWebUrl}/dashboard`, context);
            return res.redirect(`${config.userWebUrl}/dashboard`);
        } catch (error) {
            // If it's an HttpError with status 200 (like the linking scenario), it's handled above.
            // Other HttpErrors or general errors are passed to the error middleware.
            if (error instanceof HttpError && error.statusCode === 200 && error.details?.redirectTo) {
                this.logger.info(`Google login requires account linking (fallback). Redirecting to: ${error.details.redirectTo}`, context);
                return res.redirect(`${error.details.redirectTo}?linkingToken=${error.details.linkingToken}`);
            }
            next(error);
        }
    };
}

export const loginController = new LoginController(
    globalLogger,
    loginEmailPasswordService,
    loginPhoneService,
    loginWithGoogleService
);
