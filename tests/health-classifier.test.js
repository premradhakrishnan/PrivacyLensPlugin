import { jest } from '@jest/globals';
import config from '../config.js';

// Mock the config
jest.mock('../config.js', () => ({
  OPENAI_API_KEY: 'test-api-key'
}));

// Import the functions to test
import { analyzeHealthQuery, fallbackHealthCheck, extractDomain } from '../content.js';

describe('Health Query Analysis', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fallbackHealthCheck', () => {
    const testCases = [
      { query: 'flu symptoms', expected: true },
      { query: 'weather forecast', expected: false },
      { query: 'doctor near me', expected: true },
      { query: 'pizza delivery', expected: false },
      { query: 'medical insurance', expected: true },
      { query: 'symptoms of covid', expected: true },
      { query: 'treatment for anxiety', expected: true },
      { query: 'best restaurants', expected: false },
      { query: 'diagnosis for rash', expected: true },
      { query: 'movie showtimes', expected: false }
    ];

    testCases.forEach(({ query, expected }) => {
      test(`correctly classifies "${query}"`, () => {
        expect(fallbackHealthCheck(query)).toBe(expected);
      });
    });
  });

  describe('analyzeHealthQuery', () => {
    test('correctly identifies health-related query via API', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'true' } }]
        })
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await analyzeHealthQuery('headache remedies');
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`
          }
        })
      );
    });

    test('correctly identifies non-health-related query via API', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'false' } }]
        })
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await analyzeHealthQuery('weather forecast');
      expect(result).toBe(false);
    });

    test('falls back to basic classification on API error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await analyzeHealthQuery('flu symptoms');
      expect(result).toBe(true);
    });

    test('falls back to basic classification on non-200 response', async () => {
      const mockResponse = {
        ok: false,
        status: 429
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await analyzeHealthQuery('medical symptoms');
      expect(result).toBe(true);
    });
  });
});

describe('Domain Extraction', () => {
  const testCases = [
    { 
      url: 'https://www.example.com/path', 
      expected: 'example.com',
      description: 'removes www and path'
    },
    { 
      url: 'https://subdomain.example.com', 
      expected: 'subdomain.example.com',
      description: 'keeps subdomain'
    },
    { 
      url: 'http://example.com', 
      expected: 'example.com',
      description: 'handles http protocol'
    },
    { 
      url: 'https://example.com:8080', 
      expected: 'example.com',
      description: 'removes port number'
    },
    { 
      url: 'invalid-url', 
      expected: null,
      description: 'returns null for invalid URLs'
    },
    { 
      url: 'https://www.health.example.com/path?query=test', 
      expected: 'health.example.com',
      description: 'handles complex URLs'
    }
  ];

  testCases.forEach(({ url, expected, description }) => {
    test(`extractDomain ${description}: ${url}`, () => {
      expect(extractDomain(url)).toBe(expected);
    });
  });
});

// Mock storage for testing
describe('Chrome Storage Integration', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
  });

  test('updates health query count when health-related query is detected', async () => {
    // Mock storage.get to return initial count
    chrome.storage.local.get.mockImplementation((key, callback) => {
      callback({ healthQueryCount: 5 });
    });

    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'true' } }]
      })
    });

    await analyzeHealthQuery('headache symptoms');

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        healthQueryCount: 6
      })
    );
  });
});