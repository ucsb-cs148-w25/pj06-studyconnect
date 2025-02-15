const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './', // Point to your Next.js app root
});

const customJestConfig = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Ensure jest-dom is available
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock styles
        '^@/(.*)$': '<rootDir>/app/$1', // Adjust aliasing if needed
    },
    transformIgnorePatterns: ['/node_modules/(?!(firebase|some-other-esm-dependency)/)'], // Allow ESM dependencies
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

// Export the Next.js-aware Jest config
module.exports = createJestConfig(customJestConfig);