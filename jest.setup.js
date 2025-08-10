import '@testing-library/jest-dom';

// Mock Next.js environment variables
process.env.NODE_ENV = 'test';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock HTML5 Drag and Drop API
// Note: Don't modify HTMLElement.prototype directly in jsdom as it causes issues
// Instead, we'll mock drag events directly

window.DataTransfer = class DataTransfer {
  constructor() {
    this.data = {};
    this.types = [];
    this.files = [];
    this.items = [];
    this.effectAllowed = 'all';
    this.dropEffect = 'none';
  }

  setData(format, data) {
    this.data[format] = data;
    if (!this.types.includes(format)) {
      this.types.push(format);
    }
  }

  getData(format) {
    return this.data[format] || '';
  }

  clearData(format) {
    if (format) {
      delete this.data[format];
      this.types = this.types.filter(t => t !== format);
    } else {
      this.data = {};
      this.types = [];
    }
  }

  setDragImage() {
    // Mock implementation
  }
};

// Mock drag events
const createMockDragEvent = (type, options = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  event.dataTransfer = new DataTransfer();
  Object.assign(event, options);
  return event;
};

// Add drag event creators to global scope for tests
global.createDragStartEvent = (options) => createMockDragEvent('dragstart', options);
global.createDragOverEvent = (options) => createMockDragEvent('dragover', options);
global.createDropEvent = (options) => createMockDragEvent('drop', options);
global.createDragEndEvent = (options) => createMockDragEvent('dragend', options);

// Mock console methods for testing
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
