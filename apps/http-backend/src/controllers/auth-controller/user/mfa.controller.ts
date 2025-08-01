// bms-monorepo/apps/http-backend/src/controllers/auth-controller/mfa.controller.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@workspace/backend-common/http-error';
import { ILogger, LogContext } from '@workspace/backend-common/logger';
import { config, jwtConfig } from '@workspace/backend-common/config';

// Import service interface
import { ILoginMfaService } from '../../../services/auth-service/interfaces/auth.interfaces';

// Import concrete service instances (singletons) or classes for instantiation
import { logger as globalLogger } from '@workspace/backend-common/logger'; // Assuming globalLogger is available

// Import the LoginMfaService class
import { LoginMfaService as LoginMfaServiceClass } from '../../../services/auth-service/user/login-mfa.service'; // Assuming this path

// Import dependencies required by LoginMfaService
import { OtpService as OtpServiceClass } from '../../../services/auth-service/user'; // Assuming this path for OtpService class
import { AccessTokenService } from '../../../services/token-service/user/access-token.service'; // Assuming this path

import { redisClient } from '@workspace/backend-common/data-access/redis';
import { twilioSmsService } from '@workspace/backend-common/sms';
import { RefreshTokenService } from '../../../services/token-service/user/refresh-token.service';
// Assuming redisClient is exported as a singleton from this path

// Instantiate dependencies for LoginMfaService
const otpServiceInstance = new OtpServiceClass(globalLogger, redisClient, twilioSmsService);
const accessTokenServiceInstance = new AccessTokenService(globalLogger);
const refreshTokenServiceInstance = new RefreshTokenService(globalLogger);

// Instantiate LoginMfaService
const loginMfaServiceInstance = new LoginMfaServiceClass(
    globalLogger,
    otpServiceInstance,
    accessTokenServiceInstance,
    refreshTokenServiceInstance
);

export class MfaController {
    constructor(
        private readonly logger: ILogger,
        private readonly loginMfaService: ILoginMfaService,
    ) {}

    /**
     * Verifies OTP for MFA completion.
     * POST /api/auth/mfa/verify-otp
     */
    public verifyMfaOtp = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'MfaController', action: 'VERIFY_MFA_OTP_REQUEST' };
        const { mfaToken, otp } = req.body;
        // Ensure ipAddress and userAgent are always strings, and handle array type for user-agent
        const ipAddress = req.ip || 'unknown';
        const userAgent = Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'] || 'unknown';
     
       

        try {
            const result = await this.loginMfaService.verifyLoginOTP(mfaToken, otp, ipAddress, userAgent);

            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
                expires: new Date(Date.now() + jwtConfig.jwt.refreshTokenExpirationSeconds * 1000),
            });
            return res.status(200).json({
                message: 'MFA verification successful. Login complete.',
                accessToken: result.tokens.accessToken,
                user: result.user,
            });
        } catch (error) {
            next(error);
        }
    };
}

export const mfaController = new MfaController(
    globalLogger,
    loginMfaServiceInstance, // Pass the instantiated service
);
