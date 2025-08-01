// bms-monorepo/apps/http-backend/src/controllers/auth-controller/password-reset.controller.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@workspace/backend-common/http-error';
import { ILogger, LogContext } from '@workspace/backend-common/logger';
import { config } from '@workspace/backend-common/config'; // For frontend redirect URLs
import { IPasswordResetService } from '../../../services/auth-service/interfaces/auth.interfaces';
import { passwordResetService } from '../../../services/auth-service/user/password-reset.service';
import {logger as globalLogger} from '@workspace/backend-common/logger';
// Import service interface


export class PasswordResetController {
    constructor(
        private readonly logger: ILogger,
        private readonly passwordResetService: IPasswordResetService,
    ) {}

    /**
     * Handles a request to initiate a password reset.
     * Sends a password reset link/OTP to the user's email.
     * POST /api/auth/password-reset/request
     */
    public requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'PasswordResetController', action: 'REQUEST_PASSWORD_RESET' };
        const { email } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        if (!email) {
            this.logger.warn('Password reset request missing email.', context);
            return next(new HttpError(400, 'Email is required.'));
        }

        try {
            await this.passwordResetService.requestPasswordReset(email, ipAddress, userAgent);
            // Always return a generic success message to prevent email enumeration attacks
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles the actual password reset using a token received via email.
     * POST /api/auth/password-reset/reset
     */
    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const context: LogContext = { module: 'PasswordResetController', action: 'RESET_PASSWORD' };
        const { token, newPassword } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        if (!token || !newPassword) {
            this.logger.warn('Password reset request missing token or new password.', context);
            return next(new HttpError(400, 'Token and new password are required.'));
        }
        if (newPassword.length < 8) { // Basic password strength check
            this.logger.warn(`Password reset attempt with weak new password.`, context);
            throw new HttpError(400, 'New password must be at least 8 characters long.');
        }

        try {
            await this.passwordResetService.resetPassword(token, newPassword, ipAddress, userAgent);
            return res.status(200).json({ message: 'Password has been reset successfully.' });
        } catch (error) {
            next(error);
        }
    };
}

// Export a singleton instance of PasswordResetController
export const passwordResetController = new PasswordResetController(
    globalLogger,
    passwordResetService
);
