// jest.config.js
module.exports = {
  testEnvironment: "node",
  testMatch:       ["**/tests/**/*.test.js"],
  setupFilesAfterFramework: ["./tests/setup.js"],
  testTimeout:     30000,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
};
