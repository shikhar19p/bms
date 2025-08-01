// bms-monorepo/apps/http-backend/src/services/auth-service/user/credential.service.ts

import { PrismaClient, Account,  ActorType, Role } from '@workspace/db/client';
import bcrypt from 'bcryptjs';
import { ILogger, LogContext } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';
import { prismaClient } from '@workspace/db/client'; // Assuming this is your global Prisma client instance

// Corrected import path for ICredentialService
import { ICredentialService } from '../interfaces/auth.interfaces'; // <--- CORRECTED PATH HERE

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 30;

export class CredentialService implements ICredentialService {
    constructor(
        private readonly logger: ILogger,
        // Allows injecting a PrismaClient instance, defaults to global prismaClient
        private readonly prisma: PrismaClient = prismaClient
    ) {}

    public async findUserByIdentifier(identifier: string, isEmail: boolean, isPhone: boolean): Promise<(Account & { role: Role }) | null> {
        if (isEmail) {
            return this.prisma.account.findUnique({ where: { email: identifier }, include: { role: true } });
        } else if (isPhone) {
            return this.prisma.account.findUnique({ where: { phone: identifier }, include: { role: true } });
        }
        return null;
    }

    public async comparePasswords(plainPassword: string, hashedPassword?: string | null): Promise<boolean> {
        if (!hashedPassword) {
            return false;
        }
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error: any) {
            this.logger.error(`Failed to compare password: ${error.message}`, { module: 'CredentialService', action: 'COMPARE_PASSWORDS' }, error);
            throw error;
        }
    }

    public async hashPassword(plainPassword: string): Promise<string> {
        const saltRounds = 10;
        try {
            return await bcrypt.hash(plainPassword, saltRounds);
        } catch (error: any) {
            this.logger.error(`Failed to hash password: ${error.message}`, { module: 'CredentialService', action: 'HASH_PASSWORD' }, error);
            throw error;
        }
    }

    public async handleFailedLoginAttempt(userId: string, ipAddress?: string | null, userAgent?: string | null): Promise<void> {
        const context: LogContext = {
            module: 'CredentialService',
            action: 'FAILED_LOGIN_ATTEMPT',
            resourceType: 'ACCOUNT',
            resourceId: userId,
            actorId: userId,
            actorType: ActorType.USER,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
            service: 'auth-service',
        };

        try {
            const user = await this.prisma.account.findUnique({ where: { id: userId } });
            if (!user) {
                this.logger.error(`Failed login attempt for unknown user ID: ${userId}.`, context);
                return;
            }

            const currentAttempts = user.loginAttempts + 1;
            const isLocked = currentAttempts >= MAX_LOGIN_ATTEMPTS;
            const lockUntil = isLocked ? new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000) : null;

            let failedIps: { [ip: string]: { count: number; lastAttempt: string } } = {};
            if (user.failedLoginIPs) {
                try {
                    // Prisma's Json type might be stored as string, need to parse
                    failedIps = JSON.parse(user.failedLoginIPs as string);
                } catch (e) {
                    this.logger.warn(`Failed to parse failedLoginIPs for user ${userId}. Re-initializing. Error: ${e}`, context);
                    failedIps = {}; // Reset if parsing fails
                }
            }

            if (ipAddress) {
                if (!failedIps[ipAddress]) {
                    failedIps[ipAddress] = { count: 0, lastAttempt: '' }; // Initialize count and lastAttempt
                }
                failedIps[ipAddress].count++;
                failedIps[ipAddress].lastAttempt = new Date().toISOString();
            }

            await this.prisma.account.update({
                where: { id: userId },
                data: {
                    loginAttempts: currentAttempts,
                    lastLoginAttempt: new Date(),
                    isLocked: isLocked,
                    lockUntil: lockUntil,
                    // Store `failedLoginIPs` as JSON string
                    failedLoginIPs: JSON.stringify(failedIps),
                    lastIPAddress: ipAddress,
                    lastUserAgent: userAgent,
                },
            });

            this.logger.warn(
                `Failed login attempt for user ${userId}. Attempts: ${currentAttempts}/${MAX_LOGIN_ATTEMPTS}. ${isLocked ? 'Account locked.' : ''}`,
                context,
                { attempts: currentAttempts, isLocked, lockUntil }
            );
            if (isLocked) {
                this.logger.fatal(`Account ${userId} locked due to excessive failed login attempts.`, { ...context, status: 'LOCKED_ACCOUNT' });
            }
        } catch (error: any) {
            this.logger.error(`Error handling failed login attempt for user ${userId}: ${error.message}`, { ...context }, error);
        }
    }

    public async resetLoginAttempts(userId: string, ipAddress?: string | null, userAgent?: string | null): Promise<void> {
        const context: LogContext = {
            module: 'CredentialService',
            action: 'RESET_LOGIN_ATTEMPTS',
            resourceType: 'ACCOUNT',
            resourceId: userId,
            actorId: userId,
            actorType: ActorType.USER,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
            service: 'auth-service',
        };
        try {
            const user = await this.prisma.account.findUnique({ where: { id: userId } });
            if (!user) {
                this.logger.error(`User ${userId} not found when trying to reset login attempts.`, context);
                return;
            }

            let loginIpsArray: string[] = Array.isArray(user.loginIPs) ? user.loginIPs as string[] : [];
            if (ipAddress) {
                // Remove existing IP to move it to the front
                loginIpsArray = loginIpsArray.filter(ip => ip !== ipAddress);
                // Add current IP to the front and keep only the last 10
                loginIpsArray = [ipAddress, ...loginIpsArray].slice(0, 10);
            }

            await this.prisma.account.update({
                where: { id: userId },
                data: {
                    loginAttempts: 0,
                    isLocked: false,
                    lockUntil: null,
                    lastLoginAt: new Date(),
                    lastIPAddress: ipAddress,
                    lastUserAgent: userAgent,
                    loginIPs: loginIpsArray, // Store as string[] or Json type depending on your Prisma schema
                    failedLoginIPs: { set: null }, // Clear failed login IPs
                },
            });
            this.logger.info(`Login attempts reset for user ${userId}.`, context);
        } catch (error: any) {
            this.logger.error(`Error resetting login attempts for user ${userId}: ${error.message}`, { ...context }, error);
        }
    }

    public async updatePassword(userId: string, newHashedPassword: string): Promise<void> {
        const context: LogContext = {
            module: 'CredentialService',
            action: 'PASSWORD_UPDATED',
            resourceType: 'ACCOUNT',
            resourceId: userId,
            actorId: userId,
            actorType: ActorType.USER,
            service: 'auth-service',

        };
        try {
            await this.prisma.account.update({
                where: { id: userId },
                data: {
                    password: newHashedPassword,
                    passwordLastChanged: new Date(),
                },
            });
            this.logger.info(`Password updated for user ${userId}.`, context);
        } catch (error: any) {
            this.logger.error(`Error updating password for user ${userId}: ${error.message}`, { ...context }, error);
            throw new HttpError(500, 'Failed to update password.');
        }
    }

    public async updateAccountFields(userId: string, data: Partial<Account>): Promise<Account> {
        const context: LogContext = {
            module: 'CredentialService',
            action: 'ACCOUNT_FIELDS_UPDATED',
            resourceType: 'ACCOUNT',
            resourceId: userId,
            actorId: userId,
            actorType: ActorType.USER,
            service: 'auth-service',
        };
        try {
            const oldValue = await this.prisma.account.findUnique({ where: { id: userId } });
            if (!oldValue) {
                this.logger.error(`Account ${userId} not found for field update.`, context);
                throw new HttpError(404, 'Account not found.');
            }
            const updatedAccount = await this.prisma.account.update({
                where: { id: userId },
                data: {
                    // Filter out roleId as it should not be updated via this generic method
                    ...Object.fromEntries(
                        Object.entries(data).filter(([key]) => key !== 'roleId')
                    ),
                    updatedAt: new Date()
                },
            });
            this.logger.info(`Account fields updated for user ${userId}.`, { ...context, oldValue, newValue: updatedAccount });
            return updatedAccount;
        } catch (error: any) {
            this.logger.error(`Error updating account fields for user ${userId}: ${error.message}`, { ...context }, error);
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, 'Failed to update account fields.');
        }
    }
}

// Export a singleton instance of CredentialService
// In a real application, you might use a DI container to manage this.
// For now, assuming globalLogger is available.
import { logger as globalLogger } from '@workspace/backend-common/logger'; // Assuming you have a globalLogger instance

export const credentialService = new CredentialService(globalLogger, prismaClient);