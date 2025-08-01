
import { CredentialService } from './credential.service';
import { prismaClient } from '@workspace/db/client';
import bcrypt from 'bcryptjs';
import { HttpError } from '@workspace/backend-common/http-error';
import { logger as globalLogger } from '@workspace/backend-common/logger';

// Mock external dependencies
jest.mock('@workspace/db/client', () => {
  const mockPrismaClient = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    prismaClient: mockPrismaClient,
    PrismaClient: jest.fn(() => mockPrismaClient), // Mock the constructor as well
  };
});
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock('@workspace/backend-common/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe('CredentialService', () => {
  let service: CredentialService;
  let mockPrisma: any;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    phone: '1234567890',
    password: 'hashedPassword',
    loginAttempts: 0,
    isLocked: false,
    lockUntil: null,
    failedLoginIPs: null,
    loginIPs: [],
    role: { id: 'role-id', name: 'USER' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CredentialService(globalLogger, prismaClient as any);
    mockPrisma = prismaClient;
  });

  describe('findUserByIdentifier', () => {
    it('should find a user by email', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      const result = await service.findUserByIdentifier('test@example.com', true, false);
      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' }, include: { role: true } });
      expect(result).toEqual(mockUser);
    });

    it('should find a user by phone', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      const result = await service.findUserByIdentifier('1234567890', false, true);
      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { phone: '1234567890' }, include: { role: true } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user found', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      const result = await service.findUserByIdentifier('nonexistent@example.com', true, false);
      expect(result).toBeNull();
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.comparePasswords('plainPassword', 'hashedPassword');
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.comparePasswords('wrongPassword', 'hashedPassword');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBe(false);
    });

    it('should return false if hashedPassword is null or undefined', async () => {
      const result1 = await service.comparePasswords('plainPassword', null);
      const result2 = await service.comparePasswords('plainPassword', undefined);
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error if bcrypt.compare fails', async () => {
      const mockError = new Error('Bcrypt error');
      (bcrypt.compare as jest.Mock).mockRejectedValue(mockError);
      await expect(service.comparePasswords('plainPassword', 'hashedPassword')).rejects.toThrow(mockError);
      expect(globalLogger.error).toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      const result = await service.hashPassword('plainPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(result).toBe('newHashedPassword');
    });

    it('should throw error if bcrypt.hash fails', async () => {
      const mockError = new Error('Bcrypt hash error');
      (bcrypt.hash as jest.Mock).mockRejectedValue(mockError);
      await expect(service.hashPassword('plainPassword')).rejects.toThrow(mockError);
      expect(globalLogger.error).toHaveBeenCalled();
    });
  });

  describe('handleFailedLoginAttempt', () => {
    it('should increment login attempts and log warning', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, loginAttempts: 0, isLocked: false });
      mockPrisma.account.update.mockResolvedValue({});

      await service.handleFailedLoginAttempt(mockUser.id, '192.168.1.1', 'test-agent');

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          loginAttempts: 1,
          isLocked: false,
          lockUntil: null,
          lastIPAddress: '192.168.1.1',
          lastUserAgent: 'test-agent',
        }),
      }));
      expect(globalLogger.warn).toHaveBeenCalled();
    });

    it('should lock account after max attempts and log fatal', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, loginAttempts: 4, isLocked: false });
      mockPrisma.account.update.mockResolvedValue({});

      await service.handleFailedLoginAttempt(mockUser.id, '192.168.1.1', 'test-agent');

      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          loginAttempts: 5,
          isLocked: true,
          lockUntil: expect.any(Date),
        }),
      }));
      expect(globalLogger.warn).toHaveBeenCalled();
      expect(globalLogger.fatal).toHaveBeenCalled();
    });

    it('should update failedLoginIPs correctly', async () => {
      const initialFailedIps = { '192.168.1.1': { count: 1, lastAttempt: new Date().toISOString() } };
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, failedLoginIPs: JSON.stringify(initialFailedIps) });
      mockPrisma.account.update.mockResolvedValue({});

      await service.handleFailedLoginAttempt(mockUser.id, '192.168.1.1', 'test-agent');

      const expectedFailedIps = { '192.168.1.1': expect.objectContaining({ count: 2 }) };
      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          failedLoginIPs: JSON.stringify(expectedFailedIps),
        }),
      }));
    });

    it('should handle parsing error for failedLoginIPs', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, failedLoginIPs: 'invalid json' });
      mockPrisma.account.update.mockResolvedValue({});

      await service.handleFailedLoginAttempt(mockUser.id, '192.168.1.1', 'test-agent');

      expect(globalLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to parse failedLoginIPs'), expect.any(Object));
      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          failedLoginIPs: JSON.stringify({ '192.168.1.1': expect.objectContaining({ count: 1 }) }),
        }),
      }));
    });

    it('should log error if user not found during failed login attempt handling', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      await service.handleFailedLoginAttempt('non-existent-user', '192.168.1.1', 'test-agent');
      expect(globalLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed login attempt for unknown user ID'), expect.any(Object));
      expect(mockPrisma.account.update).not.toHaveBeenCalled();
    });
  });

  describe('resetLoginAttempts', () => {
    it('should reset login attempts and clear lock', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, loginAttempts: 5, isLocked: true, lockUntil: new Date() });
      mockPrisma.account.update.mockResolvedValue({});

      await service.resetLoginAttempts(mockUser.id, '192.168.1.1', 'test-agent');

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          loginAttempts: 0,
          isLocked: false,
          lockUntil: null,
          lastLoginAt: expect.any(Date),
          lastIPAddress: '192.168.1.1',
          lastUserAgent: 'test-agent',
          loginIPs: ['192.168.1.1'],
          failedLoginIPs: { set: null },
        }),
      }));
      expect(globalLogger.info).toHaveBeenCalledWith(expect.stringContaining('Login attempts reset for user'), expect.any(Object));
    });

    it('should update loginIPs correctly', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, loginIPs: ['192.168.1.2', '192.168.1.3'] });
      mockPrisma.account.update.mockResolvedValue({});

      await service.resetLoginAttempts(mockUser.id, '192.168.1.1', 'test-agent');

      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          loginIPs: ['192.168.1.1', '192.168.1.2', '192.168.1.3'],
        }),
      }));
    });

    it('should log error if user not found during reset login attempts', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      await service.resetLoginAttempts('non-existent-user', '192.168.1.1', 'test-agent');
      expect(globalLogger.error).toHaveBeenCalledWith(expect.stringContaining('User non-existent-user not found when trying to reset login attempts.'), expect.any(Object));
      expect(mockPrisma.account.update).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      mockPrisma.account.update.mockResolvedValue({});
      await service.updatePassword(mockUser.id, 'newHashedPassword');
      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: 'newHashedPassword',
          passwordLastChanged: expect.any(Date),
        },
      });
      expect(globalLogger.info).toHaveBeenCalledWith(expect.stringContaining('Password updated for user'), expect.any(Object));
    });

    it('should throw HttpError 500 if password update fails', async () => {
      mockPrisma.account.update.mockRejectedValue(new Error('DB error'));
      await expect(service.updatePassword(mockUser.id, 'newHashedPassword')).rejects.toThrow(
        new HttpError(500, 'Failed to update password.')
      );
      expect(globalLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateAccountFields', () => {
    it('should update specified account fields', async () => {
      const updatedData = { email: 'newemail@example.com', phone: '0987654321' };
      const expectedAccount = { ...mockUser, ...updatedData };
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      mockPrisma.account.update.mockResolvedValue(expectedAccount);

      const result = await service.updateAccountFields(mockUser.id, updatedData);

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          ...updatedData,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedAccount);
      expect(globalLogger.info).toHaveBeenCalledWith(expect.stringContaining('Account fields updated for user'), expect.any(Object));
    });

    it('should not update roleId', async () => {
      const updatedData = { email: 'newemail@example.com', roleId: 'new-role-id' };
      const expectedAccount = { ...mockUser, email: 'newemail@example.com' };
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      mockPrisma.account.update.mockResolvedValue(expectedAccount);

      const result = await service.updateAccountFields(mockUser.id, updatedData);

      expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.not.objectContaining({ roleId: 'new-role-id' }),
      }));
      expect(result).toEqual(expectedAccount);
    });

    it('should throw HttpError 404 if account not found for update', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      await expect(service.updateAccountFields('non-existent-user', { email: 'new@example.com' })).rejects.toThrow(
        new HttpError(404, 'Account not found.')
      );
      expect(globalLogger.error).toHaveBeenCalled();
    });

    it('should throw HttpError 500 for unexpected errors during account field update', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      mockPrisma.account.update.mockRejectedValue(new Error('DB error'));
      await expect(service.updateAccountFields(mockUser.id, { email: 'new@example.com' })).rejects.toThrow(
        new HttpError(500, 'Failed to update account fields.')
      );
      expect(globalLogger.error).toHaveBeenCalled();
    });
  });
});
