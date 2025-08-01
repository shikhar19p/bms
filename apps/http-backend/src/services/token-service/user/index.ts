// src/services/token-service/index.ts

import { BaseTokenService } from './base-token.service'; // Keep BaseTokenService class export
import { VerificationTokenService, verificationTokenService } from './verification/verification-token.service'; // Now 'verificationTokenService' is instantiated with logger

// Export specific instances for common use
export {
   
    verificationTokenService,
};

// Optionally, export the classes themselves if you want to allow consumers
// to create their own instances or extend them, potentially with different loggers.
export {
    VerificationTokenService,
    BaseTokenService,
};

// If you still prefer a single 'tokenService' object with all methods combined:
/*
import { logger as globalLogger } from '@workspace/backend-common/logger';

const baseServiceInstance = new BaseTokenService(globalLogger);
const authServiceInstance = new AuthTokenService(globalLogger);
const verificationServiceInstance = new VerificationTokenService(globalLogger);

export const tokenService = {
    // Base functions (bind them to the instance)
    verifyToken: baseServiceInstance.verifyToken.bind(baseServiceInstance),
    revokeToken: baseServiceInstance.revokeToken.bind(baseServiceInstance),
    revokeAllRefreshTokens: baseServiceInstance.revokeAllRefreshTokens.bind(baseServiceInstance),
    cleanUpExpiredAndBlacklistedTokens: baseServiceInstance.cleanUpExpiredAndBlacklistedTokens.bind(baseServiceInstance),

    // Auth functions
    generateAuthTokens: authServiceInstance.generateAuthTokens.bind(authServiceInstance),

    // Verification functions
    generateEmailVerificationToken: verificationServiceInstance.generateEmailVerificationToken.bind(verificationServiceInstance),
};
*/