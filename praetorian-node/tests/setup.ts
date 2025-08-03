import { jest, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock process.exit to prevent tests from actually exiting
const mockExit = jest.fn();

// Mock chalk to avoid color codes in test output
jest.mock('chalk', () => ({
  default: {
    blue: jest.fn((text: string) => text),
    green: jest.fn((text: string) => text),
    red: jest.fn((text: string) => text),
    yellow: jest.fn((text: string) => text),
    gray: jest.fn((text: string) => text),
    color: jest.fn((text: string) => text),
  }
}));

// Global test setup
beforeAll(() => {
  // Replace console methods
  global.console = mockConsole as any;
  
  // Replace process.exit
  global.process.exit = mockExit as any;
  
  // Set test environment
  process.env.NODE_ENV = 'test';
});

// Global test cleanup
afterAll(() => {
  jest.clearAllMocks();
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function to restore console for specific tests
export const withRealConsole = (fn: () => void) => {
  const originalConsole = global.console;
  global.console = console;
  try {
    fn();
  } finally {
    global.console = originalConsole;
  }
};

// Helper function to check if a function throws with specific error
export const expectThrowsWithMessage = (fn: () => void, expectedMessage: string) => {
  expect(() => fn()).toThrow(expectedMessage);
};

// Helper function to check if a function throws with specific error type
export const expectThrowsWithType = (fn: () => void, ErrorType: any) => {
  expect(() => fn()).toThrow(ErrorType);
};

// Helper function to check if a function doesn't throw
export const expectNotToThrow = (fn: () => void) => {
  expect(() => fn()).not.toThrow();
}; 