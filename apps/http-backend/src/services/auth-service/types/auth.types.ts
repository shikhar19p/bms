// apps/http-backend/src/services/auth-service/types/auth.types.ts

import { Account, Role } from '@workspace/db/client'; // Import Account and Role types from db client

/**
 * Result of a successful login attempt, typically indicating MFA is required.
 */
export interface LoginResult {
    mfaToken?: string; // Made optional as not all LoginResults will have it (e.g., direct login success)
    message: string;
    user?: Account; // Made optional to allow for cases where user might not be immediately available (e.g., initial MFA response)
    accessToken?: string; // Added for direct login success
    refreshToken?: string; // Added for direct login success
    redirectTo?: string; // For OAuth flows that require redirection (e.g., linking)
    linkingToken?: string; // For OAuth flows that require linking
    mfaMethod?: 'EMAIL' | 'PHONE'; // To specify the MFA method
}

/**
 * Dedicated interface for phone login results, which always involve MFA and return the user.
 */
export interface PhoneLoginResult {
    mfaToken: string;
    message: string;
    user: Account; // User is always present if phone login is successful (initiates MFA)
    mfaMethod?: 'PHONE'; // Specific to phone MFA
}

/**
 * Structure for authentication tokens (access and refresh).
 */
export interface TokenResult {
    accessToken: string;
    refreshToken: string;
}

/**
 * Result of a complete login verification, including user and tokens.
 */
export interface LoginVerificationResult {
    user: (Account & { role: Role }); // Explicitly type the user object
    tokens: TokenResult;
}

/**
 * Result of an OAuth (e.g., Google) authentication flow.
 */
export interface OAuthLoginResult {
    user: (Account & { role: Role });
    tokens: TokenResult;
    isNewUser: boolean; // Indicate if this was a new registration via OAuth
}

/**
 * Common payload for user registration.
 */
export interface RegisterPayload {
    email: string;
    password?: string; // Password might be optional for OAuth registration
    name?: string;
    phone?: string;
    roleName?: string;
}
