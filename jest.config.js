module.exports = {
  globalSetup: 'jest-preset-angular/global-setup',
  preset: 'jest-preset-angular',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@models/(.*)$': '<rootDir>/src/app/shared/models/$1',
    '^@utility/(.*)$': '<rootDir>/src/app/shared/utility/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testPathIgnorePatterns: ['/cypress/']
};
