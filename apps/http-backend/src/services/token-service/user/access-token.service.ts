// apps/backend/src/services/token-service/user/access-token.service.ts

import { BaseTokenService } from './base-token.service';
import { AccessTokenPayload } from '@workspace/common/interfaces';
import { TokenType } from '@workspace/common/enums';
import { jwtConfig } from '@workspace/backend-common/config';
import { ILogger, logger as globalLogger } from '@workspace/backend-common/logger';

export class AccessTokenService extends BaseTokenService {
  constructor(loggerInstance: ILogger = globalLogger) {
    super(loggerInstance);
  }

  // Accept payload WITHOUT `type` field
  public async generateAccessToken(
    payload: Omit<AccessTokenPayload, 'type'>,
  ): Promise<string> {
    const expiresInSeconds = jwtConfig.jwt.accessTokenExpirationSeconds;

    // Add the type field to complete the payload
    const fullPayload = {
      ...payload,
      type: TokenType.ACCESS,
    };

    return this._generateAndSaveToken(fullPayload as AccessTokenPayload, expiresInSeconds);
  }

  public async verifyAccessToken(tokenString: string): Promise<AccessTokenPayload> {
    return this.verifyToken(tokenString, TokenType.ACCESS) as Promise<AccessTokenPayload>;
  }
}
