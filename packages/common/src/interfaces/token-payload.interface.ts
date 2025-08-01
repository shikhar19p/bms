// packages/common/interfaces/token-payload.interface.ts

import { TokenType, UserRole } from "@workspace/common/enums";


export interface BaseTokenPayload {
  userId: string;
  roleId: string; // The database ID of the role
  type: TokenType;
  identifier?: string; // Optional: for verification tokens (e.g., email)
  [key: string]: any; // Allow other properties if needed in specific token types
}

export interface AccessTokenPayload extends BaseTokenPayload {
  userRole: UserRole; // Explicit role enum
  venueId?: string; // Only for VENUE_ADMIN
  permissions?: string[]; // If you implement fine-grained permissions

}

export interface VerificationTokenPayload extends BaseTokenPayload {
  identifier: string; // Enforce identifier for verification
  // Any other properties specific to verification (e.g., purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET')
}

export interface RefreshTokenPayload extends BaseTokenPayload {
  type: TokenType.REFRESH;
  // Optional: Add additional properties like sessionId, deviceId if needed in future
}