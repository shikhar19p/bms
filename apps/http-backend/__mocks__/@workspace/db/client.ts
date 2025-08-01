export const PrismaClient = jest.fn().mockImplementation(() => ({
  account: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
}));

export const prismaClient = new PrismaClient();