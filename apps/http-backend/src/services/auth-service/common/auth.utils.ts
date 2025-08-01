// apps/backend/src/services/auth-service/common/auth.utils.ts

import { HttpError } from "@workspace/backend-common/http-error";
import { config } from "@workspace/backend-common/config";

/**
 * Helper for basic password validation (can be enhanced).
 * @param {string} password - The password string.
 * @throws {HttpError} If the password does not meet criteria.
 */
export const validatePassword = (password: string): void => {
    if (password.length < config.auth.passwordMinLength) { // Use config for min length
        throw new HttpError(400, `Password must be at least ${config.auth.passwordMinLength} characters long.`);
    }
    // Add more complexity checks (e.g., regex for uppercase, lowercase, number, special char)
    if (!/[A-Z]/.test(password)) {
        throw new HttpError(400, 'Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
        throw new HttpError(400, 'Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
        throw new HttpError(400, 'Password must contain at least one number.');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        throw new HttpError(400, 'Password must contain at least one special character.');
    }
};

/**
 * Generates a random 6-digit OTP.
 * @returns {string} The generated OTP.
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};