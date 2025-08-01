// bms-monorepo/apps/backend/src/services/token-service/password-reset-token.service.ts

import { BaseTokenService } from './base-token.service'; // Can inherit directly from Base or from a dedicated VerificationTokenService
import { VerificationTokenPayload } from '@workspace/common/interfaces'; // From common package
import { TokenType } from '@workspace/common/enums'; // From common package
import { jwtConfig } from '@workspace/backend-common/config';
import { ILogger, LogContext,logger as globalLogger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';
import  jwt from 'jsonwebtoken';

export class PasswordResetTokenService extends BaseTokenService { // Or extends VerificationTokenService if you create one
  constructor(loggerInstance: ILogger = globalLogger) {
    super(loggerInstance);
  }

 public async generatePasswordResetToken(
  payload: Omit<VerificationTokenPayload, 'type'>
): Promise<string> {
  if (!payload.identifier) {
    throw new HttpError(400, 'Identifier (e.g., email) is required for password reset tokens.');
  }

  const expiresInSeconds = jwtConfig.jwt.passwordResetTokenExpirationSeconds;

  const fullPayload = {
    ...payload,
    type: TokenType.PASSWORD_RESET,
  };

  return this._generateAndSaveToken(fullPayload as VerificationTokenPayload, expiresInSeconds);
}


  public async verifyPasswordResetToken(tokenString: string, expectedIdentifier: string): Promise<any> {
    const context: LogContext = {
      module: 'PasswordResetTokenService',
      action: 'VERIFY_PASSWORD_RESET_TOKEN',
      resourceType: TokenType.PASSWORD_RESET,
    };

    let payload: VerificationTokenPayload;
    try {
        payload = jwt.verify(tokenString, this.secret) as VerificationTokenPayload;
        context.resourceId = payload.userId;
        context.actorId = payload.userId;
        context.actorType = 'USER'; // The user trying to reset password
    } catch (error: any) {
        // ... handle JWT errors similar to BaseTokenService.verifyToken
        if (error instanceof jwt.TokenExpiredError) {
          this.logger.warn(`Password reset token expired: ${tokenString.substring(0, 10)}...`, { ...context, status: 'FAILED' }, { error });
          throw new HttpError(401, 'Password reset token expired.');
        }
        if (error instanceof jwt.JsonWebTokenError) {
          this.logger.warn(`Invalid password reset token format/signature: ${tokenString.substring(0, 10)}...`, { ...context, status: 'FAILED' }, { error });
          throw new HttpError(401, 'Invalid password reset token.');
        }
        this.logger.error(`Password reset token verification failed for token ${tokenString.substring(0, 10)}...`, { ...context, status: 'FAILED' }, { error });
        throw new HttpError(500, `Password reset token verification failed: ${error.message}`);
    }

    if (payload.type !== TokenType.PASSWORD_RESET) {
        this.logger.warn(`Attempted to verify non-password reset token as password reset token. Expected ${TokenType.PASSWORD_RESET}, got ${payload.type}.`, { ...context, status: 'FAILED' });
        throw new HttpError(401, 'Invalid token type for password reset.');
    }

    const tokenDoc = await this.verifyToken(tokenString, TokenType.PASSWORD_RESET); // Leverages base verification

    if (tokenDoc.identifier !== expectedIdentifier) {
      this.logger.warn(`Password reset token identifier mismatch. Expected ${expectedIdentifier}, got ${tokenDoc.identifier}.`, {
        ...context, status: 'FAILED', resourceId: tokenDoc.accountId
      });
      throw new HttpError(401, 'Invalid password reset token for this account.');
    }

    // Invalidate the token immediately after successful verification for single-use
    await this.revokeToken(tokenString, TokenType.PASSWORD_RESET, tokenDoc.accountId);
    this.logger.info(`Password reset token successfully verified and blacklisted for user ${tokenDoc.accountId}.`, {
      ...context, status: 'SUCCESS', resourceId: tokenDoc.accountId
    });

    return tokenDoc;
  }
}