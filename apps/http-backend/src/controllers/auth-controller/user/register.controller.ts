// bms-monorepo/apps/http-backend/src/controllers/auth-controller/register.controller.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@workspace/backend-common/http-error';
import { ILogger, LogContext } from '@workspace/backend-common/logger';
import { config, jwtConfig } from '@workspace/backend-common/config';

// Import service interface

import { logger as globalLogger } from '@workspace/backend-common/logger'; // Assuming globalLogger is available
import { IEmailVerificationService, IRegisterWithEmailService } from '../../../services/auth-service/interfaces/auth.interfaces';
import { registerWithEmailService } from '../../../services/auth-service/user/register-with-email.service';
import { emailVerificationService } from '../../../services/auth-service/verification-service';

export class RegisterController {
    constructor(
        private readonly logger: ILogger,
        private readonly registerWithEmailService: IRegisterWithEmailService,
        private readonly emailVerificationService: IEmailVerificationService,
    ) {}

    /**
     * Handles new user registration with email and password.
     * POST /api/auth/register
     */
    public register = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'RegisterController', action: 'REGISTER_REQUEST' };
        const { email, password, name, phone } = req.body;
        // Ensure ipAddress and userAgent are always strings
        const ipAddress = req.ip || 'unknown'; // Provide a default string if undefined
        const userAgent = req.headers['user-agent'] || 'unknown'; // Provide a default string if undefined

        try {
            // Cast userAgent to string if it's an array of strings
            const userAgentString = Array.isArray(userAgent) ? userAgent[0] : userAgent;

            

            const result = await this.registerWithEmailService.register(email, password, ipAddress, userAgentString, name, phone);

            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
                expires: new Date(Date.now() + jwtConfig.jwt.refreshTokenExpirationSeconds * 1000),
            });
            return res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                accessToken: result.tokens.accessToken,
                user: result.user,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles email verification via a token.
     * GET /api/auth/verify-email?token=<token>
     */
    public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'RegisterController', action: 'VERIFY_EMAIL_REQUEST' };
        const { token } = req.query;
        const ipAddress = req.ip || 'unknown'; // Ensure ipAddress is always a string
        const userAgent = req.headers['user-agent'] || 'unknown'; // Ensure userAgent is always a string

        if (!token || typeof token !== 'string') {
            this.logger.warn('Email verification request missing token.', context, { query: req.query });
            return next(new HttpError(400, 'Verification token missing.'));
        }

        try {
            // Cast userAgent to string if it's an array of strings
            const userAgentString = Array.isArray(userAgent) ? userAgent[0] : userAgent;

        

            const verifiedAccount = await this.emailVerificationService.verifyEmail(token, '', ipAddress, userAgentString);

            this.logger.success(`Email verified for user ${verifiedAccount.id}. Redirecting to: ${config.userWebUrl}/email-verified`, context);
            return res.redirect(`${config.userWebUrl}/email-verified`);
        } catch (error) {
            next(error);
        }
    };
}

export const registerController = new RegisterController(
    globalLogger,
    registerWithEmailService,
    emailVerificationService
);
