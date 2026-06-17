import type { MustelCache, MustelProxy } from './types';
import type { FabricFunction } from './createProxyFactory';
import createProxyFactory from './createProxyFactory';
export type * from './types';

/**
 * Creates a type-safe proxy for dot-notation navigation with optional cache injection.
 *
 * @template T - The type definition for type safety (e.g., Locale type)
 * @param t - Translation/function that receives key and optional parameters
 * @param options - Optional configuration object for cache injection
 * @param options.cache - Optional cache instance implementing MustelCache<T> interface.
 *                        If undefined, creates a new instance on each call (no caching).
 *                        Use MapCache<T>(t) for built-in Map-based caching.
 *
 * @returns A proxy that supports both property access and function calls with type safety
 *
 * @example
 * ```typescript
 * import proxy from 'mustel-proxy';
 * import MapCache from 'mustel-proxy/cache';
 *
 * interface Locale {
 *   common: {
 *     title(p: { num: number; date: string }): string;
 *     button: { save: string };
 *   };
 * }
 *
 * const translate = (key: string, params?: any) => key;
 *
 * // Without cache (creates new instance each call)
 * const locale = proxy<Locale>(translate);
 * locale.common.title({ num: 5, date: '2024-01-01' }); // 'common.title'
 *
 * // With MapCache (caches instances across calls)
 * const cache = new MapCache<Locale>(translate);
 * const cachedLocale = proxy<Locale>(translate, { cache });
 * cachedLocale.common.button.save; // 'common.button.save' (cached)
 * ```
 */
export default function mustelProxy<T>(
  t: FabricFunction,
  options?: { cache?: MustelCache<T> }
): MustelProxy<T> {
  const cache = options?.cache;
  const key = '';

  if (cache) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const factory = createProxyFactory<T>(t);
    const instance = factory();
    cache.set(key, instance);
    return instance;
  }

  const factory = createProxyFactory<T>(t);
  return factory();
}
