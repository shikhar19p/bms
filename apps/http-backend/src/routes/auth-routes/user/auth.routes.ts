// bms-monorepo/apps/http-backend/src/routes/auth-routes/user/auth.routes.ts

import { RequestHandler, Router } from 'express';
import {
    loginSchema,
    registerSchema,
    verifyEmailSchema,
    verifyMfaOtpSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    linkGoogleAccountSchema,
    sendPhoneVerificationOtpSchema,
    verifyPhoneVerificationOtpSchema,
} from '@workspace/common/schema/auth';
import { validate } from '@workspace/backend-common/middleware';
import {
    loginController,
    mfaController,
    registerController,
    accountController,
    passwordResetController,
} from '../../../controllers/auth-controller/user';
import { requireAuth } from '../../../middleware/auth.middlware';

const authRouter: Router = Router();

// --- Login Routes ---
authRouter.post('/login', validate(loginSchema), loginController.login as RequestHandler);
authRouter.post('/login-phone', loginController.loginPhone as RequestHandler); // Assuming no validation needed, or a different schema
authRouter.get('/google', loginController.googleAuth as RequestHandler);
authRouter.get('/google/callback', loginController.googleAuthCallback as RequestHandler);

// --- MFA Routes ---
authRouter.post('/mfa/verify-otp', validate(verifyMfaOtpSchema), mfaController.verifyMfaOtp as RequestHandler);

// --- Registration Routes ---
authRouter.post('/register', validate(registerSchema), registerController.register as RequestHandler);
authRouter.get('/verify-email', validate(verifyEmailSchema), registerController.verifyEmail as RequestHandler);

// --- Password Reset Routes ---
authRouter.post('/forgot-password', validate(requestPasswordResetSchema), passwordResetController.requestPasswordReset as RequestHandler);
authRouter.post('/password-reset/reset', validate(resetPasswordSchema), passwordResetController.resetPassword as RequestHandler);

// --- Account Management Routes (Authenticated) ---
authRouter.post('/link-google-account', requireAuth, validate(linkGoogleAccountSchema), accountController.linkGoogleAccount as RequestHandler);
authRouter.post('/unlink-google-account', requireAuth, accountController.unlinkGoogleAccount as RequestHandler); // No body to validate
authRouter.post('/user/send-phone-otp', requireAuth, validate(sendPhoneVerificationOtpSchema), accountController.sendPhoneVerificationOtp as RequestHandler);
authRouter.post('/user/verify-phone-otp', requireAuth, validate(verifyPhoneVerificationOtpSchema), accountController.verifyPhoneVerificationOtp as RequestHandler);

export default authRouter;
