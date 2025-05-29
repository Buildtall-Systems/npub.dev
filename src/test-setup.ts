import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const mockIDBRequest = {
  result: null,
  error: null,
  source: null,
  transaction: null,
  readyState: 'done',
  onsuccess: null,
  onerror: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

const mockIDBObjectStore = {
  add: vi.fn(() => mockIDBRequest),
  clear: vi.fn(() => mockIDBRequest),
  count: vi.fn(() => mockIDBRequest),
  delete: vi.fn(() => mockIDBRequest),
  get: vi.fn(() => mockIDBRequest),
  getAll: vi.fn(() => mockIDBRequest),
  getAllKeys: vi.fn(() => mockIDBRequest),
  getKey: vi.fn(() => mockIDBRequest),
  put: vi.fn(() => mockIDBRequest),
  openCursor: vi.fn(() => mockIDBRequest),
  openKeyCursor: vi.fn(() => mockIDBRequest),
  index: vi.fn(),
  createIndex: vi.fn(),
  deleteIndex: vi.fn(),
  indexNames: [],
  keyPath: null,
  name: 'mockStore',
  transaction: null,
  autoIncrement: false,
};

const mockIDBTransaction = {
  abort: vi.fn(),
  commit: vi.fn(),
  objectStore: vi.fn(() => mockIDBObjectStore),
  db: null,
  durability: 'default',
  error: null,
  mode: 'readonly',
  objectStoreNames: [],
  onabort: null,
  oncomplete: null,
  onerror: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

const mockIDBDatabase = {
  close: vi.fn(),
  createObjectStore: vi.fn(() => mockIDBObjectStore),
  deleteObjectStore: vi.fn(),
  transaction: vi.fn(() => mockIDBTransaction),
  name: 'mockDB',
  objectStoreNames: [],
  onabort: null,
  onclose: null,
  onerror: null,
  onversionchange: null,
  version: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

const mockIDBOpenDBRequest = {
  ...mockIDBRequest,
  onblocked: null,
  onupgradeneeded: null,
};

global.indexedDB = {
  open: vi.fn(() => {
    const request = { ...mockIDBOpenDBRequest };
    setTimeout(() => {
      request.result = mockIDBDatabase;
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  }),
  deleteDatabase: vi.fn(() => mockIDBRequest),
  cmp: vi.fn(),
  databases: vi.fn(() => Promise.resolve([])),
} as any;

global.IDBKeyRange = {
  bound: vi.fn(),
  only: vi.fn(),
  lowerBound: vi.fn(),
  upperBound: vi.fn(),
  includes: vi.fn(),
} as any;

Object.defineProperty(window, 'indexedDB', {
  value: global.indexedDB,
  writable: true,
});

Object.defineProperty(window, 'IDBKeyRange', {
  value: global.IDBKeyRange,
  writable: true,
});

global.fetch = vi.fn();

Object.defineProperty(window, 'fetch', {
  value: global.fetch,
  writable: true,
}); 