module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@workspace/db/client$': '<rootDir>/__mocks__/@workspace/db/client.ts',
    '^@workspace/backend-common/http-error$': '<rootDir>/__mocks__/@workspace/backend-common/http-error.ts',
    '^@workspace/backend-common(.*)$': '<rootDir>/../../packages/backend-common/src$1',
    '^@workspace/common(.*)$': '<rootDir>/../../packages/common/src$1',
  },
};
