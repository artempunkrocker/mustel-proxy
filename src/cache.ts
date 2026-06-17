import type { MustelCache, MustelProxy } from './types';

/**
 * Map-based cache implementation for MustelProxy instances.
 *
 * Uses a Map for string key storage. Each FabricFunction has its own
 * dedicated cache to ensure proper isolation.
 *
 * @warning This cache is unbounded and will grow indefinitely with unique keys.
 * Use caution in long-running applications with high cardinality key spaces.
 *
 * @template T - The type being proxied (e.g., Locale, string, etc.)
 *
 * @example
 * ```typescript
 * import mustelProxy from 'mustel-proxy';
 * import MapCache from 'mustel-proxy/cache';
 *
 * const t = (key: string) => key;
 * const cache = new MapCache<Locale>();
 *
 * mustelProxy(t, { cache });
 * ```
 */
export default class MapCache<T> implements MustelCache<T> {
  private readonly cache = new Map<string, MustelProxy<T>>();
  private readonly maxSize?: number;

  /**
   * Create a new MapCache instance.
   *
   * @param options - Optional configuration
   * @param options.maxSize - Maximum number of entries to cache (undefined/0 = unlimited)
   */
  constructor(options?: { maxSize?: number }) {
    this.maxSize = options?.maxSize;
  }

  /**
   * Retrieve a cached MustelProxy instance by key.
   *
   * @param key - The string key used to store the proxy
   * @returns The cached MustelProxy<T> instance, or undefined if not found
   */
  get(key: string): MustelProxy<T> | undefined {
    return this.cache.get(key);
  }

  /**
   * Store a MustelProxy instance in the cache.
   *
   * Enforces size limit when maxSize is provided, evicting the oldest
   * entry (FIFO) when the limit is exceeded.
   *
   * @param key - The string key to associate with the proxy
   * @param value - The MustelProxy<T> instance to cache
   */
  set(key: string, value: MustelProxy<T>): void {
    if (this.maxSize && this.maxSize > 0 && this.cache.size >= this.maxSize) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const firstKey = this.cache.keys().next().value!;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Clear all cached entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current number of entries in the cache.
   *
   * @returns The cache size
   */
  size(): number {
    return this.cache.size;
  }
}
