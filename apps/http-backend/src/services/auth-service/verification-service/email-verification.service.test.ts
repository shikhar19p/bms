import { EmailVerificationService } from './email-verification.service';
import { prismaClient } from '@workspace/db/client';
import { logger as globalLogger } from '@workspace/backend-common/logger';
import { VerificationTokenService } from '../../token-service/user';
import { EmailVerificationSenderService } from './email-verification-sender.service';
import { HttpError } from '@workspace/backend-common/http-error';

// Mock external dependencies
jest.mock('@workspace/db/client', () => ({
  prismaClient: {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
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
jest.mock('../../token-service/user');
jest.mock('./email-verification-sender.service');

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let mockPrisma: any;
  let mockVerificationTokenService: jest.Mocked<VerificationTokenService>;
  let mockEmailVerificationSenderService: jest.Mocked<EmailVerificationSenderService>;

  const mockToken = 'mock-verification-token';
  const mockUserEmail = 'test@example.com';
  const mockUserId = 'user-uuid-123';
  const mockRoleId = 'role-id-1';
  const mockIpAddress = '127.0.0.1';
  const mockUserAgent = 'test-agent';
  const mockCorrelationId = 'corr-id-123';

  const mockUser = {
    id: mockUserId,
    email: mockUserEmail,
    isEmailVerified: false,
    roleId: mockRoleId,
    role: { name: 'USER' },
  };

  const mockVerifiedUser = {
    ...mockUser,
    isEmailVerified: true,
  };

  const mockTokenDoc = {
    accountId: mockUserId,
    identifier: mockUserEmail,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prismaClient;
    mockVerificationTokenService = new VerificationTokenService(globalLogger, prismaClient as any) as jest.Mocked<VerificationTokenService>;
    mockEmailVerificationSenderService = new EmailVerificationSenderService(null as any, globalLogger) as jest.Mocked<EmailVerificationSenderService>;

    service = new EmailVerificationService(
      mockVerificationTokenService,
      mockEmailVerificationSenderService,
      globalLogger
    );

    // Default mocks
    mockVerificationTokenService.verifyEmailVerificationToken.mockResolvedValue(mockTokenDoc);
    mockPrisma.account.findUnique.mockResolvedValue(mockUser);
    mockPrisma.account.update.mockResolvedValue(mockVerifiedUser);
    mockVerificationTokenService.generateEmailVerificationToken.mockResolvedValue('new-verification-token');
    mockEmailVerificationSenderService.sendEmailVerificationLink.mockResolvedValue(undefined);
  });

  describe('verifyEmail', () => {
    it('should successfully verify email and update user status', async () => {
      const result = await service.verifyEmail(
        mockToken,
        mockUserEmail,
        mockIpAddress,
        mockUserAgent,
        mockCorrelationId
      );

      expect(mockVerificationTokenService.verifyEmailVerificationToken).toHaveBeenCalledWith(mockToken, mockUserEmail);
      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId }, include: { role: true } });
      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { isEmailVerified: true, updatedAt: expect.any(Date) },
        include: { role: true },
      });
      expect(result).toEqual(mockVerifiedUser);
      expect(globalLogger.child().success).toHaveBeenCalled();
    });

    it('should throw HttpError 401 if token validation fails', async () => {
      mockVerificationTokenService.verifyEmailVerificationToken.mockRejectedValue(new HttpError(401, 'Invalid token'));

      await expect(service.verifyEmail(mockToken, mockUserEmail, mockIpAddress, mockUserAgent, mockCorrelationId)).rejects.toThrow(
        new HttpError(401, 'Invalid token')
      );
      expect(globalLogger.child().warn).toHaveBeenCalled();
    });

    it('should throw HttpError 404 if user not found', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail(mockToken, mockUserEmail, mockIpAddress, mockUserAgent, mockCorrelationId)).rejects.toThrow(
        new HttpError(404, 'User not found for this verification token.')
      );
      expect(globalLogger.child().error).toHaveBeenCalled();
    });

    it('should throw HttpError 400 if token identifier mismatches user email', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ ...mockUser, email: 'different@example.com' });

      await expect(service.verifyEmail(mockToken, mockUserEmail, mockIpAddress, mockUserAgent, mockCorrelationId)).rejects.toThrow(
        new HttpError(400, 'Verification token does not match user account.')
      );
      expect(globalLogger.child().error).toHaveBeenCalled();
    });

    it('should return user if email is already verified', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockVerifiedUser);

      const result = await service.verifyEmail(mockToken, mockUserEmail, mockIpAddress, mockUserAgent, mockCorrelationId);

      expect(mockPrisma.account.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockVerifiedUser);
      expect(globalLogger.child().info).toHaveBeenCalledWith(expect.stringContaining('already verified'), expect.any(Object));
    });

    it('should throw HttpError 500 if database update fails', async () => {
      mockPrisma.account.update.mockRejectedValue(new Error('DB error'));

      await expect(service.verifyEmail(mockToken, mockUserEmail, mockIpAddress, mockUserAgent, mockCorrelationId)).rejects.toThrow(
        new HttpError(500, 'Failed to complete email verification due to an unexpected error. Please try again.')
      );
      expect(globalLogger.child().error).toHaveBeenCalled();
    });
  });

  describe('resendEmailVerification', () => {
    it('should successfully resend email verification link', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);

      await service.resendEmailVerification(mockUserId, mockUserEmail, mockRoleId);

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(mockVerificationTokenService.generateEmailVerificationToken).toHaveBeenCalledWith(mockUserId, mockRoleId, mockUserEmail);
      expect(mockEmailVerificationSenderService.sendEmailVerificationLink).toHaveBeenCalledWith(mockUserEmail, 'new-verification-token');
      expect(globalLogger.child().success).toHaveBeenCalled();
    });

    it('should throw HttpError 404 if user not found', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      await expect(service.resendEmailVerification(mockUserId, mockUserEmail, mockRoleId)).rejects.toThrow(
        new HttpError(404, 'User not found.')
      );
      expect(globalLogger.child().error).toHaveBeenCalled();
    });

    it('should not resend if email is already verified', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockVerifiedUser);

      await service.resendEmailVerification(mockUserId, mockUserEmail, mockRoleId);

      expect(mockVerificationTokenService.generateEmailVerificationToken).not.toHaveBeenCalled();
      expect(mockEmailVerificationSenderService.sendEmailVerificationLink).not.toHaveBeenCalled();
      expect(globalLogger.child().info).toHaveBeenCalledWith(expect.stringContaining('already verified'), expect.any(Object));
    });

    it('should throw HttpError 500 if token generation fails', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      mockVerificationTokenService.generateEmailVerificationToken.mockRejectedValue(new Error('Token gen error'));

      await expect(service.resendEmailVerification(mockUserId, mockUserEmail, mockRoleId)).rejects.toThrow(
        new HttpError(500, 'Failed to resend verification email.')
      );
      expect(globalLogger.child().error).toHaveBeenCalled();
    });

    it('should throw HttpError 500 if email sending fails', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockUser);
      mockEmailVerificationSenderService.sendEmailVerificationLink.mockRejectedValue(new Error('Email send error'));

      await expect(service.resendEmailVerification(mockUserId, mockUserEmail, mockRoleId)).rejects.toThrow(
        new HttpError(500, 'Failed to resend verification email.')
      );
      expect(globalLogger.child().error).toHaveBeenCalled();
    });
  });
});
