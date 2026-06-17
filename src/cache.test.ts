import { describe, it, expect } from 'vitest';
import MapCache from './cache';

const createMockProxy = () => () => 'mock';

describe('MapCache', () => {
  it('should return undefined for non-existent key', () => {
    const cache = new MapCache<object>();
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should store and retrieve value', () => {
    const cache = new MapCache<object>();
    const mockProxy = createMockProxy();
    cache.set('key1', mockProxy);
    expect(cache.get('key1')).toBe(mockProxy);
  });

  it('should overwrite existing key', () => {
    const cache = new MapCache<object>();
    const mock1 = createMockProxy();
    const mock2 = createMockProxy();
    cache.set('key', mock1);
    cache.set('key', mock2);
    expect(cache.get('key')).toBe(mock2);
    expect(cache.size()).toBe(1);
  });

  it('should evict oldest entry when maxSize exceeded (FIFO)', () => {
    const cache = new MapCache<object>({ maxSize: 2 });
    const mock1 = createMockProxy();
    const mock2 = createMockProxy();
    const mock3 = createMockProxy();

    cache.set('key1', mock1);
    cache.set('key2', mock2);
    expect(cache.size()).toBe(2);

    cache.set('key3', mock3);
    expect(cache.size()).toBe(2);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(mock2);
    expect(cache.get('key3')).toBe(mock3);
  });

  it('should handle cache with maxSize: 1', () => {
    const cache = new MapCache<object>({ maxSize: 1 });
    const mock1 = createMockProxy();
    const mock2 = createMockProxy();

    cache.set('key1', mock1);
    expect(cache.size()).toBe(1);
    expect(cache.get('key1')).toBe(mock1);

    cache.set('key2', mock2);
    expect(cache.size()).toBe(1);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(mock2);
  });

  it('should clear all entries', () => {
    const cache = new MapCache<object>();
    cache.set('key1', createMockProxy());
    cache.set('key2', createMockProxy());
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
  });
});
