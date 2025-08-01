// bms-monorepo/apps/backend/src/services/token-service/refresh-token.service.ts

import { BaseTokenService } from './base-token.service';
import {
  RefreshTokenPayload
} from '@workspace/common/interfaces';
import { TokenType } from '@workspace/common/enums';
import { jwtConfig } from '@workspace/backend-common/config';
import { ILogger, logger as globalLogger } from '@workspace/backend-common/logger';

export class RefreshTokenService extends BaseTokenService {
  constructor(loggerInstance: ILogger = globalLogger) {
    super(loggerInstance);
  }

  public async generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string> {
    const tokenPayload= {
      ...payload,
      type: TokenType.REFRESH,
    };

    const expiresInSeconds = jwtConfig.jwt.refreshTokenExpirationSeconds;
    return this._generateAndSaveToken(tokenPayload as RefreshTokenPayload, expiresInSeconds);
  }

  public async verifyRefreshToken(tokenString: string): Promise<RefreshTokenPayload> {
    return this.verifyToken(tokenString, TokenType.REFRESH) as Promise<RefreshTokenPayload>;
  }

  public async revokeSpecificRefreshToken(tokenString: string, userId: string): Promise<void> {
    return this.revokeToken(tokenString, TokenType.REFRESH, userId);
  }

  public async revokeAllUserRefreshTokens(accountId: string): Promise<void> {
    return this.revokeAllRefreshTokens(accountId);
  }
}
