/**
 * Checks if a type extends an array type.
 * Used to enable numeric index access for array-like types.
 *
 * @template T - Type to check
 * @internal
 */
type IsArray<T> = T extends unknown[] ? true : false;

/**
 * Extracts the element type of an array.
 * Returns never for non-array types to prevent invalid access.
 *
 * @template T - Array type to extract elements from
 * @internal
 */
type ArrayElementType<T> = T extends unknown[] ? T[number] : never;

/**
 * Type-safe numeric index access for array-like proxy types.
 * Provides numeric indices that return proxied element types.
 *
 * Only applicable when T is an array type, otherwise returns empty object.
 *
 * @template T - Type to provide numeric indexing for
 * @internal
 */
type NumericIndex<T> =
  IsArray<T> extends true
    ? { [K: number]: ProxyValue<ArrayElementType<T>> }
    : Record<number, never>;

/**
 * Recursively resolves a path through a nested type structure.
 *
 * Enhanced to handle:
 * - String keys for object properties
 * - Numeric indices for array access
 * - Mixed paths like ['items', 0, 'name']
 *
 * @template T - The base type to traverse
 * @template P - Array of keys representing the path through the type
 *
 * @example
 * ```typescript
 * interface Nested {
 *   items: Array<{ id: string; value: number }>;
 *   config: { settings: { enabled: boolean } };
 * }
 *
 * // String key path
 * type Result1 = DeepPath<Nested, ['config', 'settings', 'enabled']>; // boolean
 *
 * // Array index path
 * type Result2 = DeepPath<Nested, ['items', 0]>; // { id: string; value: number }
 *
 * // Mixed path
 * type Result3 = DeepPath<Nested, ['items', 0, 'id']>; // string
 * ```
 */
export type DeepPath<T, P extends unknown[]> = P extends [infer K, ...infer R]
  ? K extends keyof T
    ? DeepPath<T[K], R>
    : IsArray<T> extends true
      ? K extends number
        ? R extends []
          ? DeepPath<ArrayElementType<T>, R>
          : DeepPath<ArrayElementType<T>, R>
        : never
      : never
  : T;

/**
 * Resolves the type for a proxy value based on the value's type.
 *
 * Enhancement: Now properly handles array types by using MustelProxy
 * for both objects and arrays, enabling numeric index access on arrays.
 *
 * - Functions returning string are preserved as function types
 * - Objects become MustelProxy instances for further navigation
 * - Arrays become MustelProxy instances with numeric index access
 * - Primitives remain unchanged
 *
 * @template V - The value type to resolve
 *
 * @example
 * ```typescript
 * interface Locale {
 *   greet: (name: string) => string; // function
 *   common: { save: string }; // object
 *   items: Array<{ name: string }>; // array
 *   count: number; // primitive
 * }
 *
 * type GreetType = ProxyValue<Locale['greet']>; // (name: string) => string
 * type CommonType = ProxyValue<Locale['common']>; // MustelProxy<{ save: string }>
 * type ItemsType = ProxyValue<Locale['items']>; // MustelProxy<Array<{ name: string }>>
 * type CountType = ProxyValue<Locale['count']>; // number
 *
 * // With array element access
 * type ElementType = ProxyValue<Array<{ name: string }>[number]>; // MustelProxy<{ name: string }>
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
 * Enhanced with numeric index support for array access: `obj.items[0].name`
 *
 * Supports both function calls and property access with full TypeScript type inference.
 * When called as a function, it returns the accumulated path as a string.
 * When accessing properties, it creates a new proxy for the nested path.
 *
 * The numeric index signature:
 * - Is only active for array types
 * - Provides type-safe access to array elements
 * - Returns a MustelProxy for the element type, enabling further navigation
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
 *   items: Array<{ name: string; active: boolean }>;
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
 *
 * // Array index access
 * locale.items[0]; // MustelProxy<{ name: string; active: boolean }>
 * locale.items[0].name; // MustelProxy<string>
 * locale.items[0].name(); // calls translate('items.0.name')
 * ```
 */
export type MustelProxy<T> = ((...args: unknown[]) => string) & {
  [K in keyof T]: ProxyValue<T[K]>;
} & NumericIndex<T>;

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
