
import { loginEmailPasswordService } from './login-email-password.service';
import { CredentialService } from './credential.service';
import { HttpError } from '@workspace/backend-common/http-error';
import { AccessTokenService } from '../../token-service/user/access-token.service';
import { RefreshTokenService } from '../../token-service/user/refresh-token.service';
import { TokenType } from '@workspace/common/enums';


// Mock dependencies
jest.mock('./credential.service');
jest.mock('../../token-service/user/access-token.service');
jest.mock('../../token-service/user/refresh-token.service');
import { logger as globalLogger } from '@workspace/backend-common/logger';

// Mock dependencies
jest.mock('@workspace/backend-common/audit/audit-service');
jest.mock('@workspace/backend-common/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    fatal: jest.fn(),
  },
}));
jest.mock('@workspace/db/client', () => {
  const mockPrismaClient = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    token: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
    prismaClient: mockPrismaClient,
  };
});

describe('LoginEmailPasswordService', () => {
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockUserId = 'user-uuid-123';
  const mockRoleId = 'role-uuid-456';
  const mockRoleName = 'USER';

  const mockUser = {
    id: mockUserId,
    email: mockEmail,
    password: 'hashedPassword123',
    isEmailVerified: true,
    isLocked: false,
    loginAttempts: 0,
    roleId: mockRoleId,
    role: {
      id: mockRoleId,
      name: mockRoleName,
      type: mockRoleName,
      description: 'Standard User',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'ACTIVE',
      rolePermissions: [
        { permission: { key: 'user:read_own_profile' }, allowed: true },
      ],
      tokens: [],
      Account: [],
    },
  };

  const mockAccessToken = 'mockAccessToken';
  const mockRefreshToken = 'mockRefreshToken';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CredentialService methods
    (CredentialService.prototype.findUserByIdentifier as jest.Mock).mockResolvedValue(mockUser);
    (CredentialService.prototype.comparePasswords as jest.Mock).mockResolvedValue(true);
    (CredentialService.prototype.handleFailedLoginAttempt as jest.Mock).mockResolvedValue(undefined);
    (CredentialService.prototype.resetLoginAttempts as jest.Mock).mockResolvedValue(undefined);

    // Mock TokenService methods
    (AccessTokenService.prototype.generateAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
    (RefreshTokenService.prototype.generateRefreshToken as jest.Mock).mockResolvedValue(mockRefreshToken);

   
  });

  it('should successfully log in a user with valid credentials and return tokens', async () => {
    const result = await loginEmailPasswordService.login(mockEmail, mockPassword);

    expect(CredentialService.prototype.findUserByIdentifier).toHaveBeenCalledWith(mockEmail, true, false);
    expect(CredentialService.prototype.comparePasswords).toHaveBeenCalledWith(mockPassword, mockUser.password);
    expect(CredentialService.prototype.resetLoginAttempts).toHaveBeenCalledWith(mockUserId, undefined, undefined);
    expect(AccessTokenService.prototype.generateAccessToken).toHaveBeenCalled();
    expect(RefreshTokenService.prototype.generateRefreshToken).toHaveBeenCalled();
   
    expect(result).toEqual({
        user: mockUser,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
  });
});

