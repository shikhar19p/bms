import { EmailVerificationSenderService } from './email-verification-sender.service';
import { BaseEmailService } from '../../email-service';
import { logger as globalLogger } from '@workspace/backend-common/logger';
import { HttpError } from '@workspace/backend-common/http-error';
import { config, jwtConfig } from '@workspace/backend-common/config';
import { getEmailVerificationTemplate } from '../../email-service';

// Mock external dependencies
jest.mock('../../email-service', () => ({
  baseEmailService: {
    sendEmail: jest.fn(),
  },
  getEmailVerificationTemplate: jest.fn(),
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
jest.mock('@workspace/backend-common/config', () => ({
  config: {
    userWebUrl: 'http://localhost:3000',
  },
  jwtConfig: {
    jwt: {
      emailVerificationTokenExpirationSeconds: 3600,
    },
  },
}));

describe('EmailVerificationSenderService', () => {
  let service: EmailVerificationSenderService;
  let mockBaseEmailService: jest.Mocked<BaseEmailService>;

  const mockEmail = 'test@example.com';
  const mockVerificationToken = 'mock-token-123';
  const mockVerificationLink = `${config.userWebUrl}/auth/verify-email?token=${mockVerificationToken}`;
  const mockExpiresInMinutes = jwtConfig.jwt.emailVerificationTokenExpirationSeconds / 60;
  const mockEmailTemplate = {
    subject: 'Verify Your Email',
    html: '<p>Please verify your email</p>',
    text: 'Please verify your email',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBaseEmailService = require('../../email-service').baseEmailService;
    (getEmailVerificationTemplate as jest.Mock).mockReturnValue(mockEmailTemplate);

    service = new EmailVerificationSenderService(mockBaseEmailService, globalLogger);
  });

  it('should successfully send an email verification link', async () => {
    await service.sendEmailVerificationLink(mockEmail, mockVerificationToken);

    expect(getEmailVerificationTemplate).toHaveBeenCalledWith({
      verificationLink: mockVerificationLink,
      expiresInMinutes: mockExpiresInMinutes,
    });
    expect(mockBaseEmailService.sendEmail).toHaveBeenCalledWith({
      to: mockEmail,
      subject: mockEmailTemplate.subject,
      html: mockEmailTemplate.html,
      text: mockEmailTemplate.text,
    });
    expect(globalLogger.child().success).toHaveBeenCalled();
  });

  it('should throw HttpError 500 if email sending fails', async () => {
    mockBaseEmailService.sendEmail.mockRejectedValue(new Error('Email send error'));

    await expect(service.sendEmailVerificationLink(mockEmail, mockVerificationToken)).rejects.toThrow(
      new HttpError(500, 'Failed to send verification email: Email send error')
    );
    expect(globalLogger.child().error).toHaveBeenCalled();
  });
});
