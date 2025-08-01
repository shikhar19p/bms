// packages/common/src/schemas/auth/index.ts

import { z } from 'zod';

// =================================================================
// Reusable Schemas
// =================================================================

const passwordSchema = z
    .string({ required_error: 'Password is required' })
    .trim()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    );

const phoneSchema = z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(10, 'Phone number seems too short')
    .max(20, 'Phone number is too long')
    // Allows digits, spaces, hyphens, parentheses, and an optional leading '+'
    .regex(/^[+]?[0-9\s-()]*$/, 'Invalid phone number format');

const emailSchema = z
    .string({ required_error: 'Email is required' })
    .trim()
    .max(255, 'Email is too long')
    .email('Invalid email format')
    .toLowerCase();

const otpSchema = z
    .string({ required_error: 'OTP is required' })
    .trim()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must only contain digits');

// =================================================================
// Auth Schemas for User Flows
// =================================================================

// POST /api/auth/login
export const loginSchema = z.object({
    identifier: z.string({ required_error: 'Identifier is required' }).trim().min(1, 'Identifier is required').max(255, 'Identifier is too long'),
    password: z.string(), // No password complexity on login
});

// POST /api/auth/register
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema, // Enforce complexity on registration
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    phone: phoneSchema.optional(),
});

// GET /api/auth/verify-email
export const verifyEmailSchema = z.object({
    token: z.string().trim().min(1, 'Verification token is required').max(512, 'Token is too long'),
});

// POST /api/auth/mfa/verify-otp
export const verifyMfaOtpSchema = z.object({
    mfaToken: z.string().trim().min(1, 'MFA token is required').max(512, 'MFA token is too long'),
    otp: otpSchema,
});

// POST /api/auth/forgot-password
export const requestPasswordResetSchema = z.object({
    email: emailSchema,
});

// POST /api/auth/password-reset/reset
export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1, 'Reset token is required').max(512, 'Token is too long'),
    newPassword: passwordSchema, // Enforce complexity on password reset
});

// POST /api/auth/link-google-account
export const linkGoogleAccountSchema = z.object({
    linkingToken: z.string().trim().min(1, 'Linking token is required').max(512, 'Token is too long'),
});

// POST /api/auth/user/send-phone-otp
export const sendPhoneVerificationOtpSchema = z.object({
    phoneNumber: phoneSchema,
});

// POST /api/auth/user/verify-phone-otp
export const verifyPhoneVerificationOtpSchema = z.object({
    otp: otpSchema,
});


// =================================================================
// Export TypeScript Types
// =================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailQuery = z.infer<typeof verifyEmailSchema>;
export type VerifyMfaOtpInput = z.infer<typeof verifyMfaOtpSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type LinkGoogleAccountInput = z.infer<typeof linkGoogleAccountSchema>;
export type SendPhoneVerificationOtpInput = z.infer<typeof sendPhoneVerificationOtpSchema>;
export type VerifyPhoneVerificationOtpInput = z.infer<typeof verifyPhoneVerificationOtpSchema>;
