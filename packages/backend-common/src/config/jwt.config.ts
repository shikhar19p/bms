import path from 'path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load the .env from this package's root directory
loadEnv({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  JWT_SECRET: z.string()
    .min(1, 'JWT secret is required')
    .max(200, 'JWT secret is too long'),

  JWT_ACCESS_EXPIRATION_SECONDS: z.coerce.number()
    .default(300), // 5 minutes

  JWT_REFRESH_EXPIRATION_SECONDS: z.coerce.number()
    .default(7 * 24 * 60 * 60), // 7 days

  JWT_RESET_PASSWORD_SECRET: z.string()
    .min(1, 'JWT reset password secret key is required')
    .max(200, 'JWT reset password secret key is too long'),

  JWT_RESET_PASSWORD_EXPIRATION_SECONDS: z.coerce.number()
    .default(10 * 60), // 10 minutes

  JWT_VERIFY_EMAIL_EXPIRATION_SECONDS: z.coerce.number()
    .default(10 * 60), // 10 minutes

  JWT_MFA_SECRET: z.string()
    .min(1, 'JWT MFA secret key is required')
    .max(200, 'JWT MFA secret key is too long'),

  JWT_MFA_EXPIRATION_SECONDS: z.coerce.number()
    .default(1 * 60), // 1 minute

  JWT_INVITATION_SECRET: z.string()
    .min(1, 'JWT invitation secret key is required')
    .max(200, 'JWT invitation secret key is too long'),

  JWT_INVITATION_EXPIRATION_SECONDS: z.coerce.number()
    .default(1440 * 60), // 1440 minutes = 24 hours

  JWT_LINKING_SECRET: z.string()
    .min(1, 'JWT linking secret key is required')
    .max(200, 'JWT linking secret key is too long'),

  JWT_LINKING_EXPIRATION_SECONDS: z.coerce.number()
    .default(60 * 60), // 1 hour

  DEFAULT_USER_ROLE_ID: z.string()
    .min(1, 'Default user role id is required')
    .max(200, 'Default user role id is too long'),
});

const envVars = envSchema.parse(process.env);

export const jwtConfig = {
  jwt: {
    secret: envVars.JWT_SECRET,
    accessTokenExpirationSeconds: envVars.JWT_ACCESS_EXPIRATION_SECONDS,
    refreshTokenExpirationSeconds: envVars.JWT_REFRESH_EXPIRATION_SECONDS,
    passwordResetTokenExpirationSeconds: envVars.JWT_RESET_PASSWORD_EXPIRATION_SECONDS,
    emailVerificationTokenExpirationSeconds: envVars.JWT_VERIFY_EMAIL_EXPIRATION_SECONDS,
    resetPassword: {
      secret: envVars.JWT_RESET_PASSWORD_SECRET,
      expirationSeconds: envVars.JWT_RESET_PASSWORD_EXPIRATION_SECONDS,
    },
    emailVerification: {
      expirationSeconds: envVars.JWT_VERIFY_EMAIL_EXPIRATION_SECONDS,
    },
    mfa: {
      secret: envVars.JWT_MFA_SECRET,
      expirationSeconds: envVars.JWT_MFA_EXPIRATION_SECONDS,
    },
    invitation: {
      secret: envVars.JWT_INVITATION_SECRET,
      expirationSeconds: envVars.JWT_INVITATION_EXPIRATION_SECONDS,
    },
    linking: {
      secret: envVars.JWT_LINKING_SECRET,
      expirationSeconds: envVars.JWT_LINKING_EXPIRATION_SECONDS,
    },
    defaultUserRoleId: envVars.DEFAULT_USER_ROLE_ID,
  },
};

