import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setServiceUnavailableHandler, categoryApi } from '../services/api';

global.fetch = vi.fn();

describe('Error Handling and Retry Mechanism', () => {
  beforeEach(() => {
    fetch.mockClear();
    setServiceUnavailableHandler(null);
  });

  it('retries requests when serviceUnavailableHandler resolves', async () => {
    // 1. First call fails with 503
    fetch.mockResolvedValueOnce({
      status: 503,
      ok: false,
      json: async () => ({ detail: 'Service temporarily unavailable' }),
    });

    // 2. Second call (retry) succeeds with 200
    fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => [{ id: 1, name: 'Hardware' }],
    });

    let handlerCalled = false;
    setServiceUnavailableHandler((path, resolve, reject) => {
      handlerCalled = true;
      expect(path).toBe('/categories');
      resolve(); // simulate user clicking retry
    });

    const data = await categoryApi.list();
    expect(handlerCalled).toBe(true);
    expect(data).toEqual([{ id: 1, name: 'Hardware' }]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fails request when serviceUnavailableHandler rejects', async () => {
    fetch.mockResolvedValueOnce({
      status: 503,
      ok: false,
      json: async () => ({ detail: 'Service temporarily unavailable' }),
    });

    let handlerCalled = false;
    setServiceUnavailableHandler((path, resolve, reject) => {
      handlerCalled = true;
      reject(new Error('Cancelled by user')); // simulate user clicking cancel
    });

    await expect(categoryApi.list()).rejects.toThrow('Service temporarily unavailable');
    expect(handlerCalled).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
