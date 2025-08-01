// bms-monorepo/apps/backend/src/services/token-service/user/base-token.service.ts

import jwt from 'jsonwebtoken';
import { prismaClient } from '@workspace/db/client'; // Your Prisma client
import { HttpError } from '@workspace/backend-common/http-error';
import { jwtConfig } from '@workspace/backend-common/config';
import { ILogger, LogContext, logger as globalLogger } from '@workspace/backend-common/logger'; // LogContext from backend-common
import { BaseTokenPayload, AccessTokenPayload, VerificationTokenPayload } from '@workspace/common/interfaces'; // From common package
import { TokenType } from '@workspace/common/enums'; // From common package

export class BaseTokenService {
  protected readonly secret: string;
  protected readonly logger: ILogger;

  constructor(loggerInstance: ILogger = globalLogger) {
    this.secret = jwtConfig.jwt.secret;
    this.logger = loggerInstance;
  }

  protected async _generateAndSaveToken(
    payload: BaseTokenPayload,
    expiresInSeconds: number,
  ): Promise<string> {
    const context: LogContext = {
      module: 'TokenService',
      action: 'GENERATE_AND_SAVE_TOKEN',
      resourceType: payload.type,
      resourceId: payload.userId,
      actorId: payload.userId,
      actorType: 'SYSTEM'
    };

    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: expiresInSeconds,
      });

      await prismaClient.token.create({
        data: {
          token,
          type: payload.type,
          accountId: payload.userId,
          roleId: payload.roleId,
          expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
          isBlacklisted: false,
        },
      });

      this.logger.success(`Token of type ${payload.type} generated and saved for user ${payload.userId}.`, context);
      return token;
    } catch (error: any) {
      this.logger.error(`Failed to generate and save token of type ${payload.type} for user ${payload.userId}.`,
        { ...context, status: 'FAILED' },
        {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          payload: { type: payload.type, userId: payload.userId, identifier: payload.identifier },
        }
      );
      throw new HttpError(500, `Failed to generate token: ${error.message}`);
    }
  }

  public async verifyToken(tokenString: string, expectedType: TokenType): Promise<any> {
    const context: LogContext = {
      module: 'TokenService',
      action: 'VERIFY_TOKEN',
      resourceType: expectedType,
    };

    let payload: BaseTokenPayload;
    try {
      payload = jwt.verify(tokenString, this.secret) as BaseTokenPayload;
      context.resourceId = payload.userId;
      context.actorId = payload.userId;
      context.actorType = 'USER';
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn(`Token expired: ${tokenString.substring(0, 10)}...`, { ...context, status: 'FAILED' }, { error });
        throw new HttpError(401, 'Token expired.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn(`Invalid token format/signature: ${tokenString.substring(0, 10)}...`, { ...context, status: 'FAILED' }, { error });
        throw new HttpError(401, 'Invalid token.');
      }
      this.logger.error(`Token verification failed for token ${tokenString.substring(0, 10)}...`, { ...context, status: 'FAILED' }, { error });
      throw new HttpError(500, `Token verification failed: ${error.message}`);
    }

    // Now include identifier in findUnique for verification tokens, if applicable
    const whereClause: any = { token: tokenString };
    // If you plan to verify verification tokens by identifier as well (e.g., "this email token is for john@example.com")
    // This is optional and depends on your exact verification flow.
    // if (expectedType === TokenType.EMAIL_VERIFICATION || expectedType === TokenType.PASSWORD_RESET) {
    //   if (payload.identifier) {
    //     whereClause.identifier = payload.identifier;
    //   }
    // }

    const tokenDoc = await prismaClient.token.findUnique({
      where: whereClause,
    });

    if (!tokenDoc) {
      this.logger.warn(`Token not found in DB: ${tokenString.substring(0, 10)}... (payload userId: ${payload.userId})`, { ...context, status: 'FAILED' });
      throw new HttpError(401, 'Token not found or already deleted.');
    }

    if (tokenDoc.type !== expectedType) {
      this.logger.warn(`Invalid token type for token ${tokenString.substring(0, 10)}... Expected ${expectedType}, got ${tokenDoc.type}.`, { ...context, status: 'FAILED' });
      throw new HttpError(401, `Invalid token type. Expected ${expectedType}, got ${tokenDoc.type}.`);
    }

    if (tokenDoc.isBlacklisted) {
      this.logger.warn(`Token is blacklisted: ${tokenString.substring(0, 10)}... (userId: ${payload.userId})`, { ...context, status: 'FAILED' });
      throw new HttpError(401, 'Token is blacklisted.');
    }

    if (tokenDoc.expiresAt < new Date()) {
      this.logger.warn(`Database record shows token expired: ${tokenString.substring(0, 10)}... (userId: ${payload.userId})`, { ...context, status: 'FAILED' });
      throw new HttpError(401, 'Token expired.');
    }

    if (payload.userId !== tokenDoc.accountId) {
      this.logger.warn(`Token payload user ID mismatch for token ${tokenString.substring(0, 10)}... Payload ID: ${payload.userId}, DB ID: ${tokenDoc.accountId}.`, { ...context, status: 'FAILED' });
      throw new HttpError(401, 'Token payload user ID mismatch.');
    }

    this.logger.info(`Token of type ${expectedType} verified successfully for user ${payload.userId}.`, { ...context, status: 'SUCCESS' });
    return tokenDoc;
  }

  public async revokeToken(tokenString: string, type: TokenType, userId: string): Promise<void> {
    const context: LogContext = {
      module: 'TokenService',
      action: 'REVOKE_TOKEN',
      resourceType: type,
      resourceId: userId,
      actorId: userId,
      actorType: 'USER'
    };

    try {
      const result = await prismaClient.token.updateMany({
        where: {
          token: tokenString,
          type: type,
          accountId: userId,
          isBlacklisted: false,
        },
        data: {
          isBlacklisted: true,
        },
      });

      if (result.count === 0) {
        this.logger.warn(`Token not found or already blacklisted for revocation: ${tokenString.substring(0, 10)}... (type: ${type}, userId: ${userId})`, { ...context, status: 'FAILED' });
        throw new HttpError(404, 'Token not found or already revoked.');
      }

      this.logger.info(`Token of type ${type} revoked successfully for user ${userId}.`, { ...context, status: 'SUCCESS' });
    } catch (error: any) {
      this.logger.error(`Failed to revoke token of type ${type} for user ${userId}.`, { ...context, status: 'FAILED' }, { error });
      throw new HttpError(500, `Failed to revoke token: ${error.message}`);
    }
  }

  public async revokeAllRefreshTokens(userId: string): Promise<void> {
    const context: LogContext = {
      module: 'TokenService',
      action: 'REVOKE_ALL_REFRESH_TOKENS',
      resourceType: TokenType.REFRESH,
      resourceId: userId,
      actorId: userId,
      actorType: 'USER'
    };

    try {
      await prismaClient.token.updateMany({
        where: {
          accountId: userId,
          type: TokenType.REFRESH,
          isBlacklisted: false,
        },
        data: {
          isBlacklisted: true,
        },
      });
      this.logger.info(`All refresh tokens revoked for user ${userId}.`, { ...context, status: 'SUCCESS' });
    } catch (error: any) {
      this.logger.error(`Failed to revoke all refresh tokens for user ${userId}.`, { ...context, status: 'FAILED' }, { error });
      throw new HttpError(500, `Failed to revoke all refresh tokens: ${error.message}`);
    }
  }

  public async cleanUpExpiredAndBlacklistedTokens(): Promise<void> {
    const context: LogContext = {
      module: 'TokenService',
      action: 'CLEANUP_TOKENS',
      resourceType: 'ALL',
      actorType: 'SYSTEM'
    };

    try {
      const now = new Date();
      const result = await prismaClient.token.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { isBlacklisted: true },
          ],
        },
      });
      this.logger.info(`Cleaned up ${result.count} expired or blacklisted tokens.`, { ...context, status: 'SUCCESS' });
    } catch (error: any) {
      this.logger.error(`Failed to clean up expired and blacklisted tokens.`, { ...context, status: 'FAILED' }, { error });
      throw new HttpError(500, `Failed to clean up tokens: ${error.message}`);
    }
  }
}