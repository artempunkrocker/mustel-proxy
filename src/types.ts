/**
 * Recursively resolves a path through a nested type structure.
 *
 * @template T - The base type to traverse
 * @template P - Array of keys representing the path through the type
 *
 * @example
 * ```typescript
 * interface Nested {
 *   a: {
 *     b: {
 *       c: string;
 *     };
 *   };
 * }
 *
 * type Result = DeepPath<Nested, ['a', 'b', 'c']>; // string
 * type Invalid = DeepPath<Nested, ['x']>]; // never (key doesn't exist)
 * ```
 */
export type DeepPath<T, P extends unknown[]> = P extends [infer K, ...infer R]
  ? K extends keyof T
    ? DeepPath<T[K], R>
    : never
  : T;

/**
 * Resolves the type for a proxy value based on the value's type.
 *
 * - Functions returning string are preserved as function types
 * - Objects become MustelProxy instances for further navigation
 * - Primitives remain unchanged
 *
 * @template V - The value type to resolve
 *
 * @example
 * ```typescript
 * interface Locale {
 *   greet: (name: string) => string; // function
 *   common: { save: string }; // object
 *   count: number; // primitive
 * }
 *
 * type GreetType = ProxyValue<Locale['greet']>; // (name: string) => string
 * type CommonType = ProxyValue<Locale['common']>; // MustelProxy<{ save: string }>
 * type CountType = ProxyValue<Locale['count']>; // number
 * ```
 */
type ProxyValue<V> = V extends (...args: infer A) => string
  ? (...args: A) => string
  : V extends Record<string, unknown>
    ? MustelProxy<V>
    : V;

/**
 * Type-safe proxy for navigating nested object structures via dot notation.
 *
 * Supports both function calls and property access with full TypeScript type inference.
 * When called as a function, it returns the accumulated path as a string.
 * When accessing properties, it creates a new proxy for the nested path.
 *
 * @template T - The type definition the proxy should conform to
 *
 * @example
 * ```typescript
 * interface Locale {
 *   common: {
 *     title(p: { num: number; date: string }): string;
 *     button: {
 *       save: string;
 *       cancel: string;
 *     };
 *   };
 * }
 *
 * const locale: MustelProxy<Locale> = proxy(translate);
 *
 * // Function calls with parameters
 * locale.common.title({ num: 5, date: '2024-01-01' }); // returns string
 *
 * // Deep nested property access
 * locale.common.button.save; // returns MustelProxy<string>
 * locale.common.button.save(); // calls translate('common.button.save')
 * ```
 */
export type MustelProxy<T> = ((...args: unknown[]) => string) & {
  [K in keyof T]: ProxyValue<T[K]>;
};

/**
 * Cache interface for storing MustelProxy instances.
 */
export interface MustelCache<T> {
  /**
   * Retrieve a cached MustelProxy instance by key.
   *
   * @param key - The string key used to store the proxy
   * @returns The cached MustelProxy<T> instance, or undefined if not found
   */
  get(key: string): MustelProxy<T> | undefined;

  /**
   * Store a MustelProxy instance in the cache.
   *
   * @param key - The string key to associate with the proxy
   * @param value - The MustelProxy<T> instance to cache
   */
  set(key: string, value: MustelProxy<T>): void;
}
