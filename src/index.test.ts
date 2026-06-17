import { describe, it, expect, vi, beforeEach } from 'vitest';
import mustelProxy from './index';
import type { FabricFunction } from './createProxyFactory';
import type { MustelProxy } from './types';

describe('mustelProxy', () => {
  const fabric = vi.fn((key: string) => key) as FabricFunction;
  const mockCache = {
    get: vi.fn<() => MustelProxy<string> | undefined>(),
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new proxy via createProxyFactory when no cache provided', () => {
    const proxy = mustelProxy<string>(fabric);
    expect(proxy).toBeDefined();
    proxy();
    expect(fabric).toHaveBeenCalledWith('');
  });

  it('should create and cache instance when cache is provided and empty', () => {
    mockCache.get.mockReturnValue(undefined);

    mustelProxy<string>(fabric, { cache: mockCache });

    expect(mockCache.get).toHaveBeenCalledWith('');
    expect(mockCache.set).toHaveBeenCalledWith('', expect.any(Function));
    expect(mockCache.set).toHaveBeenCalledTimes(1);
  });

  it('should return cached instance when cache contains it', () => {
    const cachedProxy = (() => 'cached') as unknown as MustelProxy<string>;
    mockCache.get.mockReturnValue(cachedProxy);

    const proxy = mustelProxy<string>(fabric, { cache: mockCache });

    expect(mockCache.get).toHaveBeenCalledWith('');
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(proxy).toBe(cachedProxy);
  });
});
