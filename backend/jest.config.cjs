// backend/jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    "**/tests/**/*.test.js",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  // Add this transform configuration
  transform: {
    // Use babel-jest for all .js files, excluding node_modules
    '^.+\\.[tj]s$': 'babel-jest',
  },
  // You might also need to explicitly tell Jest *not* to ignore your server.js if it's outside a typical source directory
  // transformIgnorePatterns: ['/node_modules/'], // This is usually default, but good to know
  setupFilesAfterEnv: [],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};